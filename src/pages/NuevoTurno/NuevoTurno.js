import React, { useEffect, useState } from "react";
import { useHistory } from "react-router";
import axios from "axios";
import dayjs from "dayjs";
import "dayjs/locale/es";
import {
  IonAccordion,
  IonAccordionGroup,
  IonCol,
  IonContent,
  IonDatetime,
  IonGrid,
  IonIcon,
  IonItem,
  IonLabel,
  IonList,
  IonListHeader,
  IonRow,
} from "@ionic/react";

import { close, closeOutline } from "ionicons/icons";
import "./NuevoTurno.css";
import CustomDesplegable from "../../components/CustomDesplegable/CustomDesplegable";

export default function NuevoTurno() {
  const [usuario, setUsuario] = useState({});
  const [cargando, setCargando] = useState(false);
  const [urlAxio, setUrlAxio] = useState("");
  const [tituloPagina, setTituloPagina] = useState("");
  const [especialidades, setEspecialidades] = useState([]);
  const [prestadores, setPrestadores] = useState([]);
  const [listadoPrestadores, setListadoPrestadores] = useState([]);
  const [especialidadSeleccionada, setEspecialidadSeleccionada] = useState(-1);
  const [prestadorSeleccionado, setPrestadorSeleccionado] = useState(-1);
  const [horario, setHorario] = useState(null);
  const history = useHistory();

  const traerHorariosPrestador = async (prestador) => {
    let horarios = null;
    const config = {
      headers: { Authorization: `Bearer ${usuario.token}` },
    };

    try {
      const servicio = await axios
        .get(`${urlAxio}Servicios`, config)
        .then((response) => {
          if (response.data.length !== 0) {
            return response.data;
          } else {
            return null;
          }
        });
      if (servicio !== null && prestador !== -1) {
        const response = await axios.get(
          `${urlAxio}PrestadoresHorarios/${prestador}`,
          config
        );
        if (response.data.length !== 0) {
          horarios = response.data[0];
        } else {
          horarios = null;
        }
        setHorario(horarios);
      }
    } catch (e) {
      console.log("Error");
      console.log(e.response);
    }
    setCargando(false);
  };

  const traerEspecialidades = async (paciente) => {
    let especialidades = null;
    const url = localStorage.getItem("urlAxio");
    const config = {
      headers: { Authorization: `Bearer ${paciente.token}` },
    };

    try {
      const response = await axios.get(`${url}Especialidades`, config);
      if (response.data.length !== 0) {
        especialidades = response.data;
      } else {
        especialidades = null;
      }

      especialidades = especialidades.filter(
        (especialidad) => especialidad.vigente === true
      );

      especialidades = especialidades.map((especialidad) => {
        return {
          ...especialidad,
          text: especialidad.nombre,
        };
      });

      setEspecialidades(especialidades);
    } catch (e) {
      console.log("Error");
      console.log(e.response);
    }
    setCargando(false);
  };

  const traerPrestadores = async (paciente) => {
    let prestadores = null;
    const url = localStorage.getItem("urlAxio");
    const config = {
      headers: { Authorization: `Bearer ${paciente.token}` },
    };

    try {
      const response = await axios.get(`${url}Prestadores`, config);
      if (response.data.length !== 0) {
        prestadores = response.data;
      } else {
        prestadores = null;
      }

      prestadores = prestadores.filter(
        (prestador) => prestador.vigente === true
      );

      prestadores = prestadores.map((prestador) => {
        return {
          ...prestador,
          text: prestador.nombre,
        };
      });

      setPrestadores(prestadores);
      setListadoPrestadores(prestadores);
    } catch (e) {
      console.log("Error");
      console.log(e.response);
    }
    setCargando(false);
  };

  useEffect(() => {
    try {
      const sesion = JSON.parse(sessionStorage.getItem("ppUL"));
      if (sesion !== {}) {
        traerPrestadores(sesion);
        traerEspecialidades(sesion);
        setUsuario(sesion);
        setUrlAxio(localStorage.getItem("urlAxio"));
        setTituloPagina(localStorage.getItem("nombreClinica"));
        document.title = localStorage.getItem("tituloWeb");
      }
    } catch (e) {
      history.push({ pathname: "/ErrorPage", motivo: "LostSesion" });
    }
  }, []);

  const handleChangeSelect = (value, select) => {
    switch (select) {
      case "Especialidad":
        setEspecialidadSeleccionada(value);
        if (value !== -1) {
          setListadoPrestadores(
            prestadores.filter(
              (prestador) =>
                prestador.especialidad === value ||
                prestador.especialidad2 === value ||
                prestador.especialidad3 === value
            )
          );
        } else {
          setListadoPrestadores(prestadores);
          setPrestadorSeleccionado(-1);
        }
        setHorario(null);
        break;
      case "Prestador":
        prestadores.map((prestador) => {
          if (prestador.codigo === value) {
            handleChangeSelect(prestador.especialidad, "Especialidad");
          }
        });
        setPrestadorSeleccionado(value);
        traerHorariosPrestador(value);
        break;
      default:
        console.log("invalid type of select");
        break;
    }
  };

  const [fechaSeleccionada, setFechaSeleccionada] = useState("2023-04-04");
  const fecha = dayjs("2023-04-05").format("YYYY-MM-DD");
  const fechasHabilitadas = [
    {
      date: fecha,
      textColor: "#800080",
      backgroundColor: "#ffc0cb",
    },
    {
      date: "2023-04-06",
      textColor: "#800080",
      backgroundColor: "#ffc0cb",
    },
    {
      date: "2023-04-07",
      textColor: "#800080",
      backgroundColor: "#ffc0cb",
    },
  ];

  const HabilitarFecha = (date) => {
    return fechasHabilitadas.some((fecha) => fecha.date === date);
  };

  return (
    <>
      {/*Desplegable con filtros*/}
      <div slot="content">
        {/*Filtros*/}
        <IonGrid>
          <IonRow>
            <CustomDesplegable
              array={especialidades}
              value={especialidadSeleccionada}
              handleChange={handleChangeSelect}
              mostrarTodos={true}
              label={"Seleccione un tipo de especialidad"}
              id="Especialidad"
            />
            <CustomDesplegable
              array={listadoPrestadores}
              value={prestadorSeleccionado}
              handleChange={handleChangeSelect}
              mostrarTodos={true}
              label={"Seleccione un prestador"}
              id="Prestador"
            />
          </IonRow>
        </IonGrid>

        <IonGrid>
          <IonRow
          // className="ion-align-items-start ion-justify-content-center"
          >
            <IonCol>
              <IonDatetime
                presentation="date"
                // locale="es-ES"
                onIonChange={(e) => setFechaSeleccionada(e.detail.value)}
                min={dayjs(new dayjs())}
                max={dayjs(new dayjs()).add(3, "months")}
                value={fechaSeleccionada}
                highlightedDates={fechasHabilitadas}
                isDateEnabled={HabilitarFecha}
              />
            </IonCol>
            {/* ListadoTurnos */}
            <IonCol>
              <IonList lines="none">
                <IonListHeader>
                  <h5>
                    Horarios disponibles para:{" "}
                    {dayjs(fechaSeleccionada).format("DD/MM/YYYY")}
                  </h5>
                </IonListHeader>
                <IonItem className="fila cabecera">
                  <IonCol className="celda cabecera">
                    <p>Hora</p>
                  </IonCol>
                </IonItem>
                <IonItem className="fila">
                  <IonCol className="celda">
                    <p>array horarios disponibles</p>
                  </IonCol>
                </IonItem>
              </IonList>
            </IonCol>
          </IonRow>
        </IonGrid>
      </div>
    </>
  );
}
