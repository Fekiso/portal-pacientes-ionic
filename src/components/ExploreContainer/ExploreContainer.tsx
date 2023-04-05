import HorariosPrestadores from "../../pages/HorariosPrestadores/HorariosPrestadores";
import EstudiosPaciente from "../../pages/Estudios/EstudiosPaciente";
import TurnosPaciente from "../../pages/TurnosPaciente/TurnosPaciente";
import "./ExploreContainer.css";
import NuevoTurno from "../../pages/NuevoTurno/NuevoTurno";

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
              break;
            case "Turnos":
              return <TurnosPaciente />;
              break;
            case "Horarios":
              return <HorariosPrestadores />;
              break;
            case "Reservar":
              return <NuevoTurno />;
              break;
            default:
              return (
                <>
                  <strong>{name}</strong>
                  <p>
                    Explore{" "}
                    <a
                      target="_blank"
                      rel="noopener noreferrer"
                      href="https://ionicframework.com/docs/components"
                    >
                      UI Components
                    </a>
                  </p>
                </>
              );
              break;
          }
        })()}
      </div>
    </div>
  );
};

export default ExploreContainer;
