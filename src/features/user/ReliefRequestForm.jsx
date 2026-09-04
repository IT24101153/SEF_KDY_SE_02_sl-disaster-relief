import { useState } from "react";
import { submitReliefRequest } from "../relief/reliefRequestsService";

const DISTRICTS = [
  "Colombo", "Gampaha", "Kalutara", "Ratnapura", "Kegalle",
  "Nuwara Eliya", "Badulla", "Kandy", "Galle", "Matara",
];

const NEED_TYPES = [
  { value: "food", label: "Food & drinking water" },
  { value: "shelter", label: "Emergency shelter" },
  { value: "medical", label: "Medical assistance" },
  { value: "evacuation", label: "Evacuation support" },
  { value: "other", label: "Other" },
];

export default function ReliefRequestForm({ db, currentUser, onSubmitted }) {
  const [form, setForm] = useState({
    district: "",
    needType: "",
    peopleCount: "",
    description: "",
  });
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState("idle"); // idle | submitting | success | error

  function validate(values) {
    const next = {};
    if (!values.district) next.district = "Select the district that needs help.";
    if (!values.needType) next.needType = "Select what kind of help is needed.";
    if (!values.peopleCount || Number(values.peopleCount) <= 0) {
      next.peopleCount = "Enter how many people are affected — must be at least 1.";
    }
    if (!values.description || values.description.trim().length < 10) {
      next.description = "Add a short description (at least 10 characters) so the relief team knows what to expect.";
    }
    return next;
  }

  function handleChange(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
    if (errors[field]) setErrors((e) => ({ ...e, [field]: undefined }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const validationErrors = validate(form);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    setStatus("submitting");
    try {
      await submitReliefRequest(db, form, currentUser.uid);
      setStatus("success");
      setForm({ district: "", needType: "", peopleCount: "", description: "" });
      onSubmitted?.();
    } catch (err) {
      console.error("Failed to submit relief request:", err);
      setStatus("error");
    }
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-lg space-y-5">
      <div>
        <h2 className="text-xl font-semibold text-slate-900">Request relief</h2>
        <p className="mt-1 text-sm text-slate-600">
          Tell us where help is needed. A relief coordinator will confirm a team and time.
        </p>
      </div>

      <div>
        <label htmlFor="district" className="block text-sm font-medium text-slate-800">
          District
        </label>
        <select
          id="district"
          value={form.district}
          onChange={(e) => handleChange("district", e.target.value)}
          className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-slate-900 focus:border-orange-600 focus:outline-none focus:ring-2 focus:ring-orange-200"
        >
          <option value="">Select district</option>
          {DISTRICTS.map((d) => (
            <option key={d} value={d}>{d}</option>
          ))}
        </select>
        {errors.district && <p className="mt-1 text-sm text-red-600">{errors.district}</p>}
      </div>

      <div>
        <label htmlFor="needType" className="block text-sm font-medium text-slate-800">
          Type of help needed
        </label>
        <select
          id="needType"
          value={form.needType}
          onChange={(e) => handleChange("needType", e.target.value)}
          className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-slate-900 focus:border-orange-600 focus:outline-none focus:ring-2 focus:ring-orange-200"
        >
          <option value="">Select need type</option>
          {NEED_TYPES.map((n) => (
            <option key={n.value} value={n.value}>{n.label}</option>
          ))}
        </select>
        {errors.needType && <p className="mt-1 text-sm text-red-600">{errors.needType}</p>}
      </div>

      <div>
        <label htmlFor="peopleCount" className="block text-sm font-medium text-slate-800">
          Number of people affected
        </label>
        <input
          id="peopleCount"
          type="number"
          min="1"
          value={form.peopleCount}
          onChange={(e) => handleChange("peopleCount", e.target.value)}
          className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-slate-900 focus:border-orange-600 focus:outline-none focus:ring-2 focus:ring-orange-200"
        />
        {errors.peopleCount && <p className="mt-1 text-sm text-red-600">{errors.peopleCount}</p>}
      </div>

      <div>
        <label htmlFor="description" className="block text-sm font-medium text-slate-800">
          Description
        </label>
        <textarea
          id="description"
          rows={4}
          value={form.description}
          onChange={(e) => handleChange("description", e.target.value)}
          placeholder="e.g. Water has entered 6 houses on Lake Road, families are on the second floor."
          className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-slate-900 focus:border-orange-600 focus:outline-none focus:ring-2 focus:ring-orange-200"
        />
        {errors.description && <p className="mt-1 text-sm text-red-600">{errors.description}</p>}
      </div>

      <button
        type="submit"
        disabled={status === "submitting"}
        className="w-full rounded-md bg-orange-600 px-4 py-2.5 font-medium text-white hover:bg-orange-700 disabled:opacity-60"
      >
        {status === "submitting" ? "Submitting..." : "Submit request"}
      </button>

      {status === "success" && (
        <p className="text-sm text-teal-700">Request sent. You can track it under "My Relief Requests".</p>
      )}
      {status === "error" && (
        <p className="text-sm text-red-600">Something went wrong sending your request. Try again.</p>
      )}
    </form>
  );
}