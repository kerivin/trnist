#include "utils/embed_modules.h"
#include <QJSEngine>
#include <QJSValue>
#include <QVariant>
#include <pybind11/stl.h>
#include "pybind.h"

namespace trnist::utils
{
	class ExejsProgramError : public std::runtime_error
	{
		using std::runtime_error::runtime_error;
	};
	class ExejsProcessExitError : public std::runtime_error
	{
		using std::runtime_error::runtime_error;
	};
	class ExejsRuntimeUnavailableError : public std::runtime_error
	{
		using std::runtime_error::runtime_error;
	};

	class QtJsRuntime
	{
	public:
		QtJsRuntime()
			: engine_(std::make_unique<QJSEngine>())
		{
		}

		QVariant evaluate(const std::string &script)
		{
			QJSValue result = engine_->evaluate(QString::fromStdString(script));
			if (result.isError())
			{
				throw std::runtime_error(result.toString().toStdString());
			}
			return result.toVariant();
		}

		bool is_available() const { return true; }
		std::string name() const { return "QtJSEngine"; }
		std::vector<std::string> command() const { return {"qtjs"}; }
		std::string run_source() const { return ""; }

	private:
		std::unique_ptr<QJSEngine> engine_;
	};

	class QtJsCompileContext
	{
	public:
		QtJsCompileContext(QtJsRuntime *runtime, const std::string &source = "",
						   const std::string &cwd = "")
			: runtime_(runtime), source_(source), cwd_(cwd) {}

		py::object execute(const std::string &source)
		{
			const std::string full_source = source_.empty() ? source : source_ + "\n" + source;
			QVariant result = runtime_->evaluate(full_source);
			return py::cast(result);
		}

		py::object evaluate(const std::string &source)
		{
			py::object json = py::module_::import("json");
			std::string quoted_source = json.attr("dumps")(source).cast<std::string>();
			std::string wrapped = source.empty() ? "''" : "return eval('(' + " + quoted_source + " + ')'";
			return execute(wrapped);
		}

		py::object call(const std::string &key, py::args args)
		{
			py::object json = py::module_::import("json");
			std::string args_json = json.attr("dumps")(args).cast<std::string>();
			std::string code = key + ".apply(this, " + args_json + ")";
			return evaluate(code);
		}

	private:
		QtJsRuntime *runtime_;
		std::string source_;
		std::string cwd_;
	};

	class TseWrapper
	{
	public:
		TseWrapper() : runtime_(std::make_unique<QtJsRuntime>()) {}

		QtJsCompileContext compile(const std::string &source = "", const std::string &cwd = "")
		{
			return QtJsCompileContext(runtime_.get(), source, cwd);
		}

		py::object execute(const std::string &source)
		{
			return compile().execute(source);
		}

		py::object evaluate(const std::string &source)
		{
			return compile().evaluate(source);
		}

		QtJsRuntime *current_runtime() const { return runtime_.get(); }

	private:
		std::unique_ptr<QtJsRuntime> runtime_;
	};

	PYBIND11_EMBEDDED_MODULE(exejs, m)
	{
		py::class_<QtJsRuntime>(m, "Runtime")
			.def(py::init<>())
			.def("evaluate", &QtJsRuntime::evaluate)
			.def("is_available", &QtJsRuntime::is_available)
			.def_property_readonly("name", &QtJsRuntime::name);

		py::class_<QtJsCompileContext>(m, "RuntimeCompileContext")
			.def("execute", &QtJsCompileContext::execute)
			.def("evaluate", &QtJsCompileContext::evaluate)
			.def("call", &QtJsCompileContext::call);

		py::class_<TseWrapper>(m, "Tse")
			.def(py::init<>())
			.def("compile", &TseWrapper::compile)
			.def("execute", &TseWrapper::execute)
			.def("evaluate", &TseWrapper::evaluate)
			.def_property_readonly("current_runtime", &TseWrapper::current_runtime);

		m.attr("ExejsProgramError") = py::exception<ExejsProgramError>(m, "ExejsProgramError");
		m.attr("ExejsProcessExitError") = py::exception<ExejsProcessExitError>(m, "ExejsProcessExitError");
		m.attr("ExejsRuntimeUnavailableError") = py::exception<ExejsRuntimeUnavailableError>(m, "ExejsRuntimeUnavailableError");

		m.attr("tse") = py::cast(TseWrapper());
		m.attr("compile") = py::cpp_function([](const std::string &source, const std::string &cwd)
											 { return TseWrapper().compile(source, cwd); });
		m.attr("execute") = py::cpp_function([](const std::string &source)
											 { return TseWrapper().execute(source); });
		m.attr("evaluate") = py::cpp_function([](const std::string &source)
											  { return TseWrapper().evaluate(source); });
		m.attr("runtime") = py::cast(QtJsRuntime());
	}

	void EmbedModules::init()
	{
		py::gil_scoped_acquire python_quard;
		py::exec(R"(
			import exejs
			globals().update(vars(exejs))
		)");
	}
}