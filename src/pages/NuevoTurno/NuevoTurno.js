import React, { useEffect, useState } from "react";
import { useHistory } from "react-router";
import axios from "axios";
import dayjs from "dayjs";
import "dayjs/locale/es";
import {
  IonCol,
  IonDatetime,
  IonGrid,
  IonItem,
  IonList,
  IonListHeader,
  IonRow,
} from "@ionic/react";

import { close, closeOutline } from "ionicons/icons";
import "./NuevoTurno.css";
import CustomDesplegable from "../../components/CustomDesplegable/CustomDesplegable";
import StyledButton from "../../components/StyledButton/StyledButton";
import CustomToast from "../../components/CustomToast/CustomToast";
import DialogoConfirmacion from "../../components/DialogoConfirmacion/DialogoConfirmacion";
import LoadingBackdrop from "../../components/LoadingBackdrop/LoadingBackdrop";

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
  const [turnosDisponibles, setTurnosDisponibles] = useState([]);
  const [turnoSeleccionado, setTurnoSeleccionado] = useState({});
  const [abrirModalConfirmarReserva, setAbrirModalConfirmarReserva] =
    useState(false);
  const [toast, setToast] = useState({ open: false, mensaje: "", tipo: "" });
  const mostrarNotificacion = (abrir, mensaje, tipo) => {
    let notificacion = {};
    if (abrir) {
      notificacion = { open: true, mensaje: mensaje, tipo: tipo };
    } else {
      notificacion = { open: false, mensaje: "", tipo: "" };
    }
    setToast(notificacion);
  };

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
      mostrarNotificacion(
        true,
        "Se produjo un error al consultar las especialidades registradas en el sistema",
        "rojo"
      );
    }
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
      mostrarNotificacion(
        true,
        "Se produjo un error al consultar los prestadores registrados en el sistema",
        "rojo"
      );
    }
  };

  useEffect(() => {
    setCargando(true);
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
      history.push({ pathname: "/ErrorPage" });
    }
    setCargando(false);
  }, []);

  const obtenerHorariosFechaSeleccionada = async (fecha) => {
    const config = {
      headers: { Authorization: `Bearer ${usuario.token}` },
    };

    const servicio = await axios
      .get(`${urlAxio}Servicios`, config)
      .then((response) => {
        if (response.data.length !== 0) {
          return response.data[0];
        } else {
          return null;
        }
      });

    try {
      let [fechas, agenda] = await Promise.all([
        axios.get(
          `${urlAxio}Turnos/TurnosPrestadorFechaFuturo?prestador=${prestadorSeleccionado}&mutual=${usuario.mutual}`,
          config
        ),
        axios.get(
          `${urlAxio}Turnos/TurnosPrestadorFecha/?prestador=${prestadorSeleccionado}&desde=${dayjs(
            fecha
          ).format("YYYY/MM/DD")}&hasta=${dayjs(fecha).format(
            "YYYY/MM/DD"
          )}&servicio=${servicio.codigo}`,
          config
        ),
      ]);
      let fechaSeleccionada = fechas.data;
      if (fechaSeleccionada.length !== 0) {
        fechaSeleccionada = fechaSeleccionada.filter(
          (turno) =>
            dayjs(new Date(turno.fecha)).format("YYYY/MM/DD") ===
            dayjs(fecha).format("YYYY/MM/DD")
        );
        fechaSeleccionada = fechaSeleccionada.filter(
          (turno) => turno.feriado === false
        );
        fechaSeleccionada = fechaSeleccionada.filter(
          (turno) => turno.mutualCantDado < turno.mutualCupo
        );
      } else {
        fechaSeleccionada = [];
      }

      if (fechaSeleccionada.length !== 0 && agenda.data.length !== 0) {
        const agendaDelDia = agenda.data.filter(
          (dia) =>
            dia.fecha === fechaSeleccionada[0].fecha &&
            dia.paciente === 0 &&
            !dia.cancelado
        );
        if (agendaDelDia.length > 0) {
          setTurnosDisponibles(agendaDelDia);
        } else {
          mostrarNotificacion(
            true,
            "No hay turnos disponibles para el dia indicado",
            "amarillo"
          );
        }
      } else {
        mostrarNotificacion(
          true,
          "No hay turnos disponibles para el dia indicado",
          "amarillo"
        );
      }
    } catch (e) {
      mostrarNotificacion(true,"Ha ocurrido un error al intentar cargar los turnos disponibles para la fecha indicada", "rojo")
    }
  };

  const obtenerTurnosProximos = async (
    prestador,
    config,
    horarios,
    atiende
  ) => {
    const turnosFiltradosPorRestriccion = [];
    const turnosProximos = [];
    const diasSemana = [
      "Domingo",
      "Lunes",
      "Martes",
      "Miercoles",
      "Jueves",
      "Viernes",
      "Sabado",
    ];
    try {
      const response = await axios.get(
        `${urlAxio}Turnos/TurnosPrestadorFechaFuturo?prestador=${prestador}&mutual=${usuario.mutual}`,
        config
      );

      const listadoTurnos = response.data.filter(
        (turno) =>
          turno.feriado === false &&
          (dayjs(turno.fecha).isSame(new dayjs()) ||
            dayjs(turno.fecha).isAfter(new dayjs()))
      );

      if (listadoTurnos.length > 0) {
        if (atiende.length > 0) {
          listadoTurnos.forEach((turno) => {
            const diaSemana = dayjs(turno.fecha).get("d");
            switch (diasSemana[diaSemana]) {
              case "Domingo":
                if (
                  atiende.length === 0 ||
                  turno.mutualCantDado < atiende[0].domingo
                ) {
                  turnosFiltradosPorRestriccion.push(turno);
                }
                break;
              case "Lunes":
                if (
                  atiende.length === 0 ||
                  turno.mutualCantDado < atiende[0].lunes
                ) {
                  turnosFiltradosPorRestriccion.push(turno);
                }
                break;
              case "Martes":
                if (
                  atiende === [] ||
                  turno.mutualCantDado < atiende[0].martes
                ) {
                  turnosFiltradosPorRestriccion.push(turno);
                }
                break;
              case "Miercoles":
                if (
                  atiende.length === 0 ||
                  turno.mutualCantDado < atiende[0].miercoles
                ) {
                  turnosFiltradosPorRestriccion.push(turno);
                }
                break;
              case "Jueves":
                if (
                  atiende.length === 0 ||
                  turno.mutualCantDado < atiende[0].jueves
                ) {
                  turnosFiltradosPorRestriccion.push(turno);
                }
                break;
              case "Viernes":
                if (
                  atiende.length === 0 ||
                  turno.mutualCantDado < atiende[0].viernes
                ) {
                  turnosFiltradosPorRestriccion.push(turno);
                }
                break;
              case "Sabado":
                if (
                  atiende.length === 0 ||
                  turno.mutualCantDado < atiende[0].sabado
                ) {
                  turnosFiltradosPorRestriccion.push(turno);
                }
                break;
              default:
                break;
            }
          });
        } else {
          listadoTurnos.forEach((turno) =>
            turnosFiltradosPorRestriccion.push(turno)
          );
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
      mostrarNotificacion(
        true,
        "Se produjo un error al intentar consultar los turnos libres para el prestador en la fecha seleccionada",
        "rojo"
      );
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

    const servicio = await axios
      .get(`${urlAxio}Servicios`, config)
      .then((response) => {
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

      horarios =
        horariosResponse.data.length !== 0 ? horariosResponse.data : null;
      atiende =
        atiendeResponse.data.length !== 0
          ? atiendeResponse.data.filter((a) => a.mutual === usuario.mutual)
          : [];

      if (!horarios || !horarios[0]?.prestador) {
        mostrarNotificacion(
          true,
          "El prestador seleccionado no tiene un horario definido",
          "rojo"
        );
      } else {
        turnosProximos = await obtenerTurnosProximos(
          prestador,
          config,
          horarios[0],
          atiende
        );
      }
      setFechasFuturas(turnosProximos);
      setFechaSeleccionada(turnosProximos[0].date);
    } catch (e) {
      mostrarNotificacion(
        true,
        "Se produjo un error al intentar consultar los horarios disponibles del prestador",
        "rojo"
      );
    }
  };

  const actualizarTurno = async () => {
    try {
      const config = {
        headers: { Authorization: `Bearer ${usuario.token}` },
      };

      let servicio = null;
      const serviciosResponse = await axios.get(`${urlAxio}Servicios`, config);

      if (serviciosResponse.data.length !== 0) {
        servicio = serviciosResponse.data[0];
      }

      if (servicio?.codigo !== null && turnoSeleccionado) {
        const actualizarTurnoResponse = await axios.patch(
          `${urlAxio}Turnos/DarTurno/${turnoSeleccionado.codigo}?servicio=${servicio.codigo}`,
          {
            codigo: turnoSeleccionado.codigo,
            paciente: usuario.codigo,
            mutual: usuario.mutual,
            // estudio: 0,
            prestador: prestadorSeleccionado,
            telemedicina: turnoSeleccionado.telemedicina,
            observaciones: "Turno reservado via web por el paciente",
          },
          config
        );

        if (
          actualizarTurnoResponse.status === 200 &&
          actualizarTurnoResponse.statusText === "OK"
        ) {
          mostrarNotificacion(
            true,
            "El turno se reservó correctamente",
            "verde"
          );
        } else {
          mostrarNotificacion(
            true,
            "Ocurrió un problema al intentar reservar el turno",
            "rojo"
          );
        }
      }
    } catch (error) {
      mostrarNotificacion(
        true,
        "Ocurrió un problema al intentar reservar el turno",
        "rojo"
      );
    }
  };

  const handleChangeSelect = (value, select) => {
    setCargando(true);
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
        mostrarNotificacion(true,"Seleccion invalida", "rojo")
        break;
    }
    setCargando(false);
  };

  const HabilitarFecha = (date) => {
    return fechasFuturas.some((fecha) => fecha.date === date);
  };

  const handleChangeFecha = (value) => {
    setTurnosDisponibles([]);
    setFechaSeleccionada(value);
    obtenerHorariosFechaSeleccionada(value);
  };

  const togleAbrirCerrarConfirmarReserva = () => {
    if (abrirModalConfirmarReserva) {
      setTurnoSeleccionado({});
      // handleChangeSelect(-1, "Especialidad");
    }
    setAbrirModalConfirmarReserva(!abrirModalConfirmarReserva);
  };

  const handleClickSeleccionarTurno = (turno) => {
    setTurnoSeleccionado(turno);
    togleAbrirCerrarConfirmarReserva();
  };

  const handleClickConfirmarHacerReserva = async () => {
    setCargando(true);
    await actualizarTurno();
    togleAbrirCerrarConfirmarReserva();
    setFechaSeleccionada("");
    setTurnosDisponibles([]);
    setCargando(false);
  };

  return (
    <>
      {/*Desplegable con filtros*/}
      <div slot="content">
        {/*Filtros*/}
        <IonGrid>
          <IonRow>
            <IonCol size="12" size-md="6">
              <IonItem>
                <CustomDesplegable
                  array={especialidades}
                  value={especialidadSeleccionada}
                  handleChange={handleChangeSelect}
                  mostrarTodos={true}
                  label={"Seleccione un tipo de especialidad"}
                  id="Especialidad"
                />
              </IonItem>
            </IonCol>

            <IonCol size="12" size-md="6">
              <IonItem>
                <CustomDesplegable
                  array={listadoPrestadores}
                  value={prestadorSeleccionado}
                  handleChange={handleChangeSelect}
                  mostrarTodos={true}
                  label={"Seleccione un prestador"}
                  id="Prestador"
                />
              </IonItem>
            </IonCol>
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
                        Horarios disponibles para:{" "}
                        {dayjs(fechaSeleccionada).format("DD/MM/YYYY")}
                      </h5>
                    </IonListHeader>

                    <IonGrid>
                      <IonRow>
                        {turnosDisponibles.map((turno) => (
                          <IonCol
                            sizeXs="12"
                            sizeMd="6"
                            sizeLg="3"
                            key={turno.codigo}
                          >
                            <StyledButton
                              expand="block"
                              className="blanco"
                              onClick={() => handleClickSeleccionarTurno(turno)}
                            >
                              {dayjs(turno.hora).format("HH:mm")}
                            </StyledButton>
                          </IonCol>
                        ))}
                      </IonRow>
                    </IonGrid>
                  </IonList>
                </IonCol>
              ) : null}
            </IonRow>
          </IonGrid>
        ) : null}
      </div>

      <DialogoConfirmacion
        titulo="Reservar turno"
        contenido={`Ha seleccionado el turno con el/la prestador/a ${
          turnoSeleccionado.prestadorNom
        }, con especialidad en ${
          turnoSeleccionado.especialidadNom
        }, para el dia ${dayjs(turnoSeleccionado.fecha).format(
          "DD/MM/YYYY"
        )}, a las ${dayjs(turnoSeleccionado.hora).format(
          "HH:mm"
        )}, ¿es esto correcto?`}
        abrirCerrarModal={abrirModalConfirmarReserva}
        handleclickBotonNo={togleAbrirCerrarConfirmarReserva}
        handleclickBotonSi={handleClickConfirmarHacerReserva}
        colorBotonNo="amarillo"
        colorBotonSi="verde"
        textoBotonNo="No, no lo estoy"
        textoBotonSi="Si, es correcto"
      />

      <CustomToast
        openToast={toast.open}
        onDidDismiss={(e) => mostrarNotificacion(false, "", "")}
        message={toast.mensaje}
        colorNotificacion={toast.tipo}
      />
      {cargando && <LoadingBackdrop visualizar={cargando} />}
    </>
  );
}
