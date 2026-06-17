import type { Program } from "@/types";

interface SemesterFilterBarProps {
  programs: Program[];
  selectedProgram: string;
  selectedSemester: number;
  onProgramChange: (programId: string) => void;
  onSemesterChange: (semester: number) => void;
}

export function SemesterFilterBar({
  programs,
  selectedProgram,
  selectedSemester,
  onProgramChange,
  onSemesterChange,
}: SemesterFilterBarProps) {
  const selectedProgramObj = programs.find((p) => p.id === selectedProgram);
  const semesters = selectedProgramObj
    ? Array.from({ length: selectedProgramObj.duration }, (_, i) => i + 1)
    : [];

  return (
    <div className="flex flex-col gap-4 sm:flex-row">
      <select
        value={selectedProgram}
        onChange={(e) => onProgramChange(e.target.value)}
        className="block w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 shadow-sm transition-colors focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 sm:w-72"
        aria-label="Select program"
      >
        {programs.map((program) => (
          <option key={program.id} value={program.id}>
            {program.name}
          </option>
        ))}
      </select>
      <select
        value={selectedSemester}
        onChange={(e) => onSemesterChange(Number(e.target.value))}
        className="block w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 shadow-sm transition-colors focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 sm:w-48"
        aria-label="Select semester"
      >
        {semesters.map((sem) => (
          <option key={sem} value={sem}>
            Semester {sem}
          </option>
        ))}
      </select>
    </div>
  );
}
