import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

const CURRENT_VERSION = "1.5";

const WhatsNewDialog = () => {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const seen = localStorage.getItem("whats-new-seen");
    if (seen !== CURRENT_VERSION) {
      setOpen(true);
    }
  }, []);

  const handleClose = () => {
    localStorage.setItem("whats-new-seen", CURRENT_VERSION);
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && handleClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl">🎉 O que há de novo?</DialogTitle>
          <DialogDescription className="text-base font-medium text-foreground/80">
            Versão {CURRENT_VERSION} disponível
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 text-sm">
          <div>
            <span className="font-semibold text-primary">✏️ Novidade:</span>{" "}
            O campo <strong>SETOR</strong> agora é editável, igual ao campo Nome. Basta clicar na linha do setor no cartão, digitar o novo valor e confirmar com Enter — ou clicar fora para salvar. Usar Esc desfaz a alteração.
          </div>
        </div>

        <Button onClick={handleClose} className="w-full mt-2">
          Continuar
        </Button>
      </DialogContent>
    </Dialog>
  );
};

export default WhatsNewDialog;
