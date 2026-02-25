import { useState } from "react";
import SetupWizard from "@/components/SetupWizard";
import DocumentPreview from "@/components/DocumentPreview";
import type { MonthTheme } from "@/lib/monthThemes";
import { monthThemes } from "@/lib/monthThemes";
import type { BirthdayPerson } from "@/lib/excelParser";

const Aniversariantes = () => {
  const [docVisible, setDocVisible] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState<number | null>(null);
  const [selectedCount, setSelectedCount] = useState(0);
  const [people, setPeople] = useState<BirthdayPerson[]>([]);
  const [returnToStep, setReturnToStep] = useState<number | undefined>(undefined);

  const handleComplete = (month: number, _theme: MonthTheme, ppl: BirthdayPerson[]) => {
    setSelectedMonth(month);
    setSelectedCount(ppl.length);
    setPeople(ppl);
    setDocVisible(true);
    setReturnToStep(undefined);
  };

  const handleBack = () => {
    setDocVisible(false);
    setReturnToStep(3);
  };

  if (!docVisible || !selectedMonth) {
    return (
      <SetupWizard
        onComplete={handleComplete}
        initialStep={returnToStep}
        initialMonth={selectedMonth ?? undefined}
        initialCount={selectedCount || undefined}
      />
    );
  }

  return (
    <DocumentPreview
      month={selectedMonth}
      theme={monthThemes[selectedMonth]}
      people={people}
      onBack={handleBack}
    />
  );
};

export default Aniversariantes;
