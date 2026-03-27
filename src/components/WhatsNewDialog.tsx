import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import whatsNewImage from "@/assets/whats-new-v1.3.png";

const CURRENT_VERSION = "1.3";

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
            <span className="font-semibold text-primary">✨ Novidade:</span>{" "}
            Dois novos botões nos cards de foto — <strong>Remoção de Fundo</strong> e{" "}
            <strong>Ajuste Automático de Cor</strong> para impressão.
          </div>
          <div>
            <span className="font-semibold text-primary">⚡ Melhoria:</span>{" "}
            Compactação automática de mídia, tornando o aplicativo mais leve e rápido.
          </div>
        </div>

        <img
          src={whatsNewImage}
          alt="Exemplo dos novos botões de remoção de fundo e ajuste de cor"
          className="w-full rounded-lg border mt-2"
        />

        <Button onClick={handleClose} className="w-full mt-2">
          Continuar
        </Button>
      </DialogContent>
    </Dialog>
  );
};

export default WhatsNewDialog;
