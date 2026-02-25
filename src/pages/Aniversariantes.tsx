import { useState } from "react";
import SetupWizard from "@/components/SetupWizard";
import DocumentPreview from "@/components/DocumentPreview";
import type { MonthTheme } from "@/lib/monthThemes";
import type { BirthdayPerson } from "@/lib/excelParser";

const Aniversariantes = () => {
  const [state, setState] = useState<{
    month: number;
    theme: MonthTheme;
    people: BirthdayPerson[];
  } | null>(null);

  if (!state) {
    return (
      <SetupWizard
        onComplete={(month, theme, people) => setState({ month, theme, people })}
      />
    );
  }

  return (
    <DocumentPreview
      month={state.month}
      theme={state.theme}
      people={state.people}
      onBack={() => setState(null)}
    />
  );
};

export default Aniversariantes;
