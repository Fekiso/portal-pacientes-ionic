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
  const [fechasFuturas, setFechasFuturas] = useState([]);
  const [fechaSeleccionada, setFechaSeleccionada] = useState("");
  const [turnosDisponibles, setTurnosDisponibles] = useState("");
  const history = useHistory();

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

      especialidades = especialidades.filter((especialidad) => especialidad.vigente === true);

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

      prestadores = prestadores.filter((prestador) => prestador.vigente === true);

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

  const obtenerHorariosFechaSeleccionada = async (fecha) => {
    const config = {
      headers: { Authorization: `Bearer ${usuario.token}` },
    };

    const servicio = await axios.get(`${urlAxio}Servicios`, config).then((response) => {
      if (response.data.length !== 0) {
        return response.data[0];
      } else {
        return null;
      }
    });

    try {
      let [fechaSeleccionada, agenda] = await Promise.all([
        axios.get(
          `${urlAxio}Turnos/TurnosPrestadorFechaFuturo?prestador=${prestadorSeleccionado}&mutual=${usuario.mutual}`,
          config
        ),
        axios.get(
          `${urlAxio}Turnos/TurnosPrestadorFecha/?prestador=${prestadorSeleccionado}&desde=${dayjs(
            fecha
          ).format("YYYY/MM/DD")}&hasta=${dayjs(fecha).format("YYYY/MM/DD")}&servicio=${
            servicio[0].codigo
          }`,
          config
        ),
      ]);
      console.log(fechaSeleccionada);
      if (fechaSeleccionada.length !== 0) {
        fechaSeleccionada = fechaSeleccionada.filter((turno) => turno.feriado === false);
        fechaSeleccionada = fechaSeleccionada.filter(
          (turno) =>
            dayjs(new Date(turno.fecha)).format("YYYY/MM/DD") === dayjs(fecha).format("YYYY/MM/DD")
        );
        fechaSeleccionada = fechaSeleccionada.filter((turno) => turno.paciente === 0);
        fechaSeleccionada = fechaSeleccionada.filter(
          (turno) => turno.mutualCantDado < turno.mutualCupo
        );
      } else {
        fechaSeleccionada = [];
      }

      if (fechaSeleccionada.length !== 0 && agenda.length !== 0) {
        setTurnosDisponibles(agenda.filter((dia) => dia.fecha === fechaSeleccionada[0].fecha));
      } else {
        console.log("No hay turnos disponibles para el dia indicado");
      }
    } catch (e) {
      console.log("Error");
      console.log(e.response);
    }
  };

  const obtenerTurnosProximos = async (prestador, config, horarios, atiende) => {
    const turnosFiltradosPorRestriccion = [];
    const turnosProximos = [];
    const diasSemana = ["Domingo", "Lunes", "Martes", "Miercoles", "Jueves", "Viernes", "Sabado"];
    try {
      const response = await axios.get(
        `${urlAxio}Turnos/TurnosPrestadorFechaFuturo?prestador=${prestador}&mutual=${usuario.mutual}`,
        config
      );

      const listadoTurnos = response.data.filter(
        (turno) =>
          turno.feriado === false &&
          (dayjs(turno.fecha).isSame(new dayjs()) || dayjs(turno.fecha).isAfter(new dayjs()))
      );

      if (listadoTurnos.length > 0) {
        if (atiende.length > 0) {
          listadoTurnos.forEach((turno) => {
            const diaSemana = dayjs(turno.fecha).get("d");
            switch (diasSemana[diaSemana]) {
              case "Domingo":
                if (atiende.length === 0 || turno.mutualCantDado < atiende[0].domingo) {
                  turnosFiltradosPorRestriccion.push(turno);
                }
                break;
              case "Lunes":
                if (atiende.length === 0 || turno.mutualCantDado < atiende[0].lunes) {
                  turnosFiltradosPorRestriccion.push(turno);
                }
                break;
              case "Martes":
                if (atiende === [] || turno.mutualCantDado < atiende[0].martes) {
                  turnosFiltradosPorRestriccion.push(turno);
                }
                break;
              case "Miercoles":
                if (atiende.length === 0 || turno.mutualCantDado < atiende[0].miercoles) {
                  turnosFiltradosPorRestriccion.push(turno);
                }
                break;
              case "Jueves":
                if (atiende.length === 0 || turno.mutualCantDado < atiende[0].jueves) {
                  turnosFiltradosPorRestriccion.push(turno);
                }
                break;
              case "Viernes":
                if (atiende.length === 0 || turno.mutualCantDado < atiende[0].viernes) {
                  turnosFiltradosPorRestriccion.push(turno);
                }
                break;
              case "Sabado":
                if (atiende.length === 0 || turno.mutualCantDado < atiende[0].sabado) {
                  turnosFiltradosPorRestriccion.push(turno);
                }
                break;
              default:
                break;
            }
          });
        } else {
          listadoTurnos.forEach((turno) => turnosFiltradosPorRestriccion.push(turno));
        }
      }

      if (turnosFiltradosPorRestriccion.length > 0) {
        turnosFiltradosPorRestriccion.forEach((turno) => {
          const fechaTurno = dayjs(turno.fecha).format("YYYY-MM-DD");
          const diaSemana = dayjs(turno.fecha).get("d");
          switch (diasSemana[diaSemana]) {
            case "Domingo":
              if (
                (horarios.domingoMDe !== "" && horarios.domingoMHa) ||
                (horarios.domingoTDe !== "" && horarios.domingoTHa !== "")
              ) {
                turnosProximos.push({
                  date: fechaTurno,
                  textColor: "#800080",
                  backgroundColor: "#ffc0cb",
                });
              }
              break;
            case "Lunes":
              if (
                (horarios.lunesMDe !== "" && horarios.lunesMHa) ||
                (horarios.lunesTDe !== "" && horarios.lunesTHa !== "")
              ) {
                turnosProximos.push({
                  date: fechaTurno,
                  textColor: "#800080",
                  backgroundColor: "#ffc0cb",
                });
              }
              break;
            case "Martes":
              if (
                (horarios.martesMDe !== "" && horarios.martesMHa) ||
                (horarios.martesTDe !== "" && horarios.martesTHa !== "")
              ) {
                turnosProximos.push({
                  date: fechaTurno,
                  textColor: "#800080",
                  backgroundColor: "#ffc0cb",
                });
              }
              break;
            case "Miercoles":
              if (
                (horarios.miercolesMDe !== "" && horarios.miercolesMHa) ||
                (horarios.miercolesTDe !== "" && horarios.miercolesTHa !== "")
              ) {
                turnosProximos.push({
                  date: fechaTurno,
                  textColor: "#800080",
                  backgroundColor: "#ffc0cb",
                });
              }
              break;
            case "Jueves":
              if (
                (horarios.juevesMDe !== "" && horarios.juevesMHa) ||
                (horarios.juevesTDe !== "" && horarios.juevesTHa !== "")
              ) {
                turnosProximos.push({
                  date: fechaTurno,
                  textColor: "#800080",
                  backgroundColor: "#ffc0cb",
                });
              }
              break;
            case "Viernes":
              if (
                (horarios.viernesMDe !== "" && horarios.viernesMHa) ||
                (horarios.viernesTDe !== "" && horarios.viernesTHa !== "")
              ) {
                turnosProximos.push({
                  date: fechaTurno,
                  textColor: "#800080",
                  backgroundColor: "#ffc0cb",
                });
              }
              break;
            case "Sabado":
              if (
                (horarios.sabadoMDe !== "" && horarios.sabadoMHa) ||
                (horarios.sabadoTDe !== "" && horarios.sabadoTHa !== "")
              ) {
                turnosProximos.push({
                  date: fechaTurno,
                  textColor: "#800080",
                  backgroundColor: "#ffc0cb",
                });
              }
              break;
            default:
              break;
          }
        });
      }
    } catch (e) {
      console.log("Error");
      console.log(e.response);
    }

    return turnosProximos;
  };

  const traerHorariosAtencion = async (prestador) => {
    let horarios = null;
    let atiende = [];
    let turnosProximos = [];

    const config = {
      headers: { Authorization: `Bearer ${usuario.token}` },
    };

    const servicio = await axios.get(`${urlAxio}Servicios`, config).then((response) => {
      if (response.data.length !== 0) {
        return response.data[0];
      } else {
        return null;
      }
    });

    try {
      const [horariosResponse, atiendeResponse] = await Promise.all([
        axios.get(
          `${urlAxio}PrestadoresHorarios?prestador=${prestador}&servicio=${servicio.codigo}`,
          config
        ),
        axios.get(
          `${urlAxio}Prestadores/RestriccionesPorMutual/${prestador}?servicio=${servicio.codigo}`,
          config
        ),
      ]);

      horarios = horariosResponse.data.length !== 0 ? horariosResponse.data : null;
      atiende =
        atiendeResponse.data.length !== 0
          ? atiendeResponse.data.filter((a) => a.mutual === usuario.mutual)
          : [];

      if (!horarios || !horarios[0]?.prestador) {
        console.log("El prestador seleccionado no tiene un horario definido", "Error");
      } else {
        turnosProximos = await obtenerTurnosProximos(prestador, config, horarios[0], atiende);
      }
      setFechasFuturas(turnosProximos);
      setFechaSeleccionada(turnosProximos[0].date);
    } catch (e) {
      console.log("Error");
      console.log(e.response);
    }
  };

  const handleChangeSelect = (value, select) => {
    switch (select) {
      case "Especialidad":
        setEspecialidadSeleccionada(value);
        if (value !== -1) {
          setListadoPrestadores(
            prestadores.filter((prestador) => prestador.especialidad === value)
          );
        } else {
          setListadoPrestadores(prestadores);
          setPrestadorSeleccionado(-1);
        }
        setFechasFuturas([]);
        break;
      case "Prestador":
        prestadores.forEach((prestador) => {
          if (prestador.codigo === value) {
            handleChangeSelect(prestador.especialidad, "Especialidad");
          }
        });
        setPrestadorSeleccionado(value);
        traerHorariosAtencion(value);
        break;
      default:
        console.log("invalid type of select");
        break;
    }
  };

  const HabilitarFecha = (date) => {
    return fechasFuturas.some((fecha) => fecha.date === date);
  };

  const handleChangeFecha = (value) => {
    setFechaSeleccionada(value);
    obtenerHorariosFechaSeleccionada(value);
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

        {fechasFuturas.length > 0 ? (
          <IonGrid>
            <IonRow
            // className="ion-align-items-start ion-justify-content-center"
            >
              <IonCol>
                <IonDatetime
                  presentation="date"
                  // locale="es-ES"
                  onIonChange={(e) => handleChangeFecha(e.detail.value)}
                  min={dayjs(new dayjs()).format("YYYY-MM-DD")}
                  max={dayjs(new dayjs()).add(3, "months").format("YYYY-MM-DD")}
                  value={fechaSeleccionada}
                  highlightedDates={fechasFuturas}
                  isDateEnabled={HabilitarFecha}
                />
              </IonCol>
              {/* ListadoTurnos */}
              {turnosDisponibles.length > 0 ? (
                <IonCol>
                  <IonList lines="none">
                    <IonListHeader>
                      <h5>
                        Horarios disponibles para: {dayjs(fechaSeleccionada).format("DD/MM/YYYY")}
                      </h5>
                    </IonListHeader>
                    <IonItem className="fila cabecera">
                      <IonCol className="celda cabecera">
                        <p>Hora</p>
                      </IonCol>
                    </IonItem>
                    {turnosDisponibles.map((turno) => (
                      <IonItem className="fila">
                        <IonCol className="celda">
                          <p>{dayjs(turno.hora).format("HH:mm")}</p>
                        </IonCol>
                      </IonItem>
                    ))}
                  </IonList>
                </IonCol>
              ) : null}
            </IonRow>
          </IonGrid>
        ) : null}
      </div>
    </>
  );
}
