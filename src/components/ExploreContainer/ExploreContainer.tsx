import HorariosPrestadores from "../../pages/HorariosPrestadores/HorariosPrestadores";
import EstudiosPaciente from "../../pages/Estudios/EstudiosPaciente";
import TurnosPaciente from "../../pages/TurnosPaciente/TurnosPaciente";
import "./ExploreContainer.css";
import NuevoTurno from "../../pages/NuevoTurno/NuevoTurno";
import PageError from "../../pages/PageError/PageError";
import MainPage from "../../pages/MainPage/MainPage";

interface ContainerProps {
  name: string;
}

const ExploreContainer: React.FC<ContainerProps> = ({ name }) => {
  return (
    <div className="container">
      <div className="container">
        {(() => {
          switch (name) {
            case "Estudios":
              return <EstudiosPaciente />;
            case "Turnos":
              return <TurnosPaciente />;
            case "Horarios":
              return <HorariosPrestadores />;
            case "Reservar":
              return <NuevoTurno />;
            case "Main":
              return <MainPage />;
            default:
              return <PageError motivo="404" />;
          }
        })()}
      </div>
    </div>
  );
};

export default ExploreContainer;
