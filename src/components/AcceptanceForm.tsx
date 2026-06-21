import React, { useState, useRef } from "react";
import { AcceptanceData, LETTER_TEMPLATES } from "../types";
import { 
  User, 
  School, 
  BookOpen, 
  Hash, 
  Sparkles, 
  FileText, 
  RotateCcw, 
  Info
} from "lucide-react";

interface AcceptanceFormProps {
  data: AcceptanceData;
  onChange: (newData: Partial<AcceptanceData>) => void;
  onReset: () => void;
  onSubmit: (e: React.FormEvent) => void;
}

export const AcceptanceForm: React.FC<AcceptanceFormProps> = ({
  data,
  onChange,
  onReset,
  onSubmit,
}) => {
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showAdvanced, setShowAdvanced] = useState(false);
  const logoInputRef = useRef<HTMLInputElement>(null);
  const sigInputRef = useRef<HTMLInputElement>(null);

  // Auto-generate reference number for validity
  const handleGenerateNewRef = () => {
    const randomNum = Math.floor(10000 + Math.random() * 90000);
    onChange({ referenceNo: `NH-STU-${randomNum}` });
  };

  // Basic validation checked on final generation click
  const validateForm = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    if (!data.fullName.trim()) newErrors.fullName = "Full student name is required";
    if (!data.institution.trim()) newErrors.institution = "Institution name is required";
    if (!data.department.trim()) newErrors.department = "Department name is required";
    if (!data.matricNo.trim()) newErrors.matricNo = "Matriculation number is required";

    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      onSubmit(e);
    }
  };

  // Convert upload image to Base64 data url for html2canvas
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, fieldName: "customLogoUrl" | "customSignatureUrl") => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        onChange({ [fieldName]: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const clearUploadedImage = (fieldName: "customLogoUrl" | "customSignatureUrl") => {
    onChange({ [fieldName]: null });
  };

  return (
    <form 
      id="acceptance-form-container"
      onSubmit={validateForm} 
      className="bg-white rounded border border-slate-200 shadow-sm p-6 md:p-8 space-y-6"
    >
      {/* Title block */}
      <div className="border-b border-slate-200 pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-indigo-50 text-indigo-600 rounded">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900 tracking-tight">Student & Academic Details</h2>
            <p className="text-xs text-slate-500">Fill in details to customize your official document letterhead</p>
          </div>
        </div>
      </div>

      {/* CORE FORM FIELDS */}
      <div className="space-y-4">
        
        {/* Full Name */}
        <div>
          <label className="block text-xs font-bold text-slate-650 uppercase tracking-wide mb-2">
            Student Full Name <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <User className="w-4 h-4" />
            </div>
            <input
              id="form-input-fullname"
              type="text"
              className={`w-full pl-10 pr-4 py-2.5 rounded border text-sm font-medium transition-all focus:outline-none ${
                errors.fullName 
                  ? "border-red-300 bg-red-50/20 focus:border-red-500 focus:ring-2 focus:ring-red-100" 
                  : "border-slate-205 bg-slate-50/40 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 text-slate-800"
              }`}
              placeholder="e.g. Kumven Wright Mangwang"
              value={data.fullName}
              onChange={(e) => {
                onChange({ fullName: e.target.value });
                if (errors.fullName) setErrors(prev => ({ ...prev, fullName: "" }));
              }}
            />
          </div>
          {errors.fullName && (
            <p className="text-xs text-red-500 font-semibold mt-1.5 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-red-500" /> {errors.fullName}
            </p>
          )}
        </div>

        {/* Institution Name */}
        <div>
          <label className="block text-xs font-bold text-slate-650 uppercase tracking-wide mb-2">
            Institution Name <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <School className="w-4 h-4" />
            </div>
            <input
              id="form-input-institution"
              type="text"
              className={`w-full pl-10 pr-4 py-2.5 rounded border text-sm font-medium transition-all focus:outline-none ${
                errors.institution 
                  ? "border-red-300 bg-red-50/20 focus:border-red-500 focus:ring-2 focus:ring-red-100" 
                  : "border-slate-205 bg-slate-50/40 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 text-slate-800"
              }`}
              placeholder="e.g. Nasarawa State University"
              value={data.institution}
              onChange={(e) => {
                onChange({ institution: e.target.value });
                if (errors.institution) setErrors(prev => ({ ...prev, institution: "" }));
              }}
            />
          </div>
          {errors.institution && (
            <p className="text-xs text-red-500 font-semibold mt-1.5 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-red-500" /> {errors.institution}
            </p>
          )}
        </div>

        {/* Dynamic Twin Input Row: Department & Matric No */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Department */}
          <div>
            <label className="block text-xs font-bold text-slate-650 uppercase tracking-wide mb-2">
              Department <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <BookOpen className="w-4 h-4" />
              </div>
              <input
                id="form-input-department"
                type="text"
                className={`w-full pl-10 pr-4 py-2.5 rounded border text-sm font-medium transition-all focus:outline-none ${
                  errors.department 
                    ? "border-red-300 bg-red-50/20 focus:border-red-500 focus:ring-2 focus:ring-red-100" 
                    : "border-slate-205 bg-slate-50/40 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 text-slate-800"
                }`}
                placeholder="e.g. Computer Science"
                value={data.department}
                onChange={(e) => {
                  onChange({ department: e.target.value });
                  if (errors.department) setErrors(prev => ({ ...prev, department: "" }));
                }}
              />
            </div>
            {errors.department && (
              <p className="text-xs text-red-500 font-semibold mt-1.5 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-red-500" /> {errors.department}
              </p>
            )}
          </div>

          {/* Matric Number */}
          <div>
            <label className="block text-xs font-bold text-slate-650 uppercase tracking-wide mb-2">
              Matric / Registration No <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Hash className="w-4 h-4" />
              </div>
              <input
                id="form-input-matric"
                type="text"
                className={`w-full pl-10 pr-4 py-2.5 rounded border text-sm font-medium transition-all focus:outline-none ${
                  errors.matricNo 
                    ? "border-red-300 bg-red-50/20 focus:border-red-500 focus:ring-2 focus:ring-red-100" 
                    : "border-slate-205 bg-slate-50/40 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 text-slate-800"
                }`}
                placeholder="e.g. FT23CMP0560"
                value={data.matricNo}
                onChange={(e) => {
                  onChange({ matricNo: e.target.value });
                  if (errors.matricNo) setErrors(prev => ({ ...prev, matricNo: "" }));
                }}
              />
            </div>
            {errors.matricNo && (
              <p className="text-xs text-red-500 font-semibold mt-1.5 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-red-500" /> {errors.matricNo}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* FORM ACTIONS */}
      <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-slate-200">
        
        {/* Submit Generate Action */}
        <button
          id="form-btn-submit"
          type="submit"
          className="flex-1 flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 active:scale-[0.98] text-white font-bold text-sm py-3 px-6 rounded transition-all cursor-pointer shadow-md shadow-indigo-100"
        >
          <FileText className="w-4 h-4" />
          <span>Apply Changes & Lock Preview</span>
        </button>

        {/* Reset Action */}
        <button
          id="form-btn-reset"
          type="button"
          onClick={onReset}
          className="bg-slate-100 hover:bg-slate-200 text-slate-705 py-3 px-5 rounded border border-slate-250 font-semibold text-sm transition-all flex items-center justify-center gap-2 cursor-pointer"
          title="Restore standard defaults"
        >
          <RotateCcw className="w-4 h-4" />
          <span>Reset Form</span>
        </button>
      </div>

      {/* Quick helpful notice */}
      <div className="flex gap-2 p-3.5 bg-slate-50 rounded text-slate-550 text-[11px] items-start border border-slate-200">
        <Info className="w-4 h-4 text-indigo-650 flex-shrink-0 mt-0.5" />
        <p className="leading-relaxed">
          The document automatically tracks and previews your inputs in real-time. For printing or high-density PDF exports, adjust student and academic details above and use the Export panel on the right.
        </p>
      </div>
    </form>
  );
};
