import { useNavigate } from "react-router-dom";
import { Cake, Briefcase } from "lucide-react";

const Home = () => {
  const navigate = useNavigate();

  const apps = [
    {
      title: "Aniversariantes do Mês",
      description: "Gere documentos A4 com os aniversariantes da empresa",
      icon: Cake,
      route: "/aniversariantes",
      gradient: "from-pink-500 to-rose-500",
      hoverGradient: "from-pink-600 to-rose-600",
      emoji: "🎂",
      badge: { label: "Pronto para uso", color: "bg-green-500" },
    },
    {
      title: "Dia das Profissões",
      description: "Crie artes personalizadas para datas comemorativas",
      icon: Briefcase,
      route: "/dia-das-profissoes",
      gradient: "from-blue-500 to-indigo-600",
      hoverGradient: "from-blue-600 to-indigo-700",
      emoji: "💼",
      badge: { label: "Em desenvolvimento", color: "bg-amber-500" },
    },
  ];

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center p-6"
      style={{
        background: "linear-gradient(135deg, hsl(220 30% 96%), hsl(220 30% 88%))",
      }}
    >
      <div className="text-center mb-12">
        <h1
          className="text-4xl md:text-5xl font-bold mb-3"
          style={{ fontFamily: "var(--font-display)", color: "hsl(220 20% 20%)" }}
        >
          🎉 Hub de Ferramentas
        </h1>
        <p className="text-muted-foreground text-lg">Escolha uma ferramenta para começar</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-3xl w-full">
        {apps.map((app) => (
          <button
            key={app.route}
            onClick={() => navigate(app.route)}
            className={`group relative bg-gradient-to-br ${app.gradient} hover:${app.hoverGradient} text-white rounded-3xl p-10 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-[1.03] active:scale-[0.98] cursor-pointer`}
          >
            {/* Badge */}
            <span className={`absolute top-4 right-4 ${app.badge.color} text-white text-xs font-bold px-3 py-1 rounded-full shadow-md`}>
              {app.badge.label}
            </span>
            <div className="text-5xl mb-4">{app.emoji}</div>
            <app.icon size={48} className="mb-4 opacity-90" />
            <h2 className="text-2xl font-bold mb-2" style={{ fontFamily: "var(--font-display)" }}>
              {app.title}
            </h2>
            <p className="text-white/80 text-sm">{app.description}</p>
            <div className="absolute bottom-4 right-4 opacity-50 group-hover:opacity-100 transition-opacity">
              →
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default Home;
