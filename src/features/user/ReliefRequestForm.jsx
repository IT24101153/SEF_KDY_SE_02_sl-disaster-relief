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
    <section className="card">
      <div className="card-head">
        <h2>Request relief</h2>
        <p>Tell us where help is needed. A relief coordinator will confirm a team and time.</p>
      </div>

      <form className="form-grid" onSubmit={handleSubmit} noValidate>
        <div className="field">
          <label htmlFor="district">District</label>
          <select
            id="district"
            value={form.district}
            onChange={(e) => handleChange("district", e.target.value)}
            className={errors.district ? "invalid" : ""}
          >
            <option value="">Select district</option>
            {DISTRICTS.map((d) => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>
          {errors.district && <span className="field-error">{errors.district}</span>}
        </div>

        <div className="field">
          <label htmlFor="needType">Type of help needed</label>
          <select
            id="needType"
            value={form.needType}
            onChange={(e) => handleChange("needType", e.target.value)}
            className={errors.needType ? "invalid" : ""}
          >
            <option value="">Select need type</option>
            {NEED_TYPES.map((n) => (
              <option key={n.value} value={n.value}>{n.label}</option>
            ))}
          </select>
          {errors.needType && <span className="field-error">{errors.needType}</span>}
        </div>

        <div className="field">
          <label htmlFor="peopleCount">Number of people affected</label>
          <input
            id="peopleCount"
            type="number"
            min="1"
            value={form.peopleCount}
            onChange={(e) => handleChange("peopleCount", e.target.value)}
            className={errors.peopleCount ? "invalid" : ""}
          />
          {errors.peopleCount && <span className="field-error">{errors.peopleCount}</span>}
        </div>

        <div className="field field-wide">
          <label htmlFor="description">Description</label>
          <textarea
            id="description"
            rows={4}
            value={form.description}
            onChange={(e) => handleChange("description", e.target.value)}
            placeholder="e.g. Water has entered 6 houses on Lake Road, families are on the second floor."
            className={errors.description ? "invalid" : ""}
          />
          {errors.description && <span className="field-error">{errors.description}</span>}
        </div>

        <div className="form-actions">
          <button type="submit" className="btn btn-primary" disabled={status === "submitting"}>
            {status === "submitting" ? "Submitting..." : "Submit request"}
          </button>
        </div>

        {status === "success" && (
          <p className="field-wide form-message success">
            Request sent. You can track it under "My Relief Requests".
          </p>
        )}
        {status === "error" && (
          <p className="field-wide form-message error">
            Something went wrong sending your request. Try again.
          </p>
        )}
      </form>
    </section>
  );
}
