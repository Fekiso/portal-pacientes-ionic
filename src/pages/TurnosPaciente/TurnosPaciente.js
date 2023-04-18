import React, { useEffect, useState } from "react";
import { useHistory } from "react-router";
import axios from "axios";
import dayjs from "dayjs";
import "dayjs/locale/es";
import {
  IonAccordion,
  IonAccordionGroup,
  IonButton,
  IonCol,
  IonGrid,
  IonIcon,
  IonItem,
  IonLabel,
  IonList,
  IonRow,
} from "@ionic/react";

import { close, closeOutline } from "ionicons/icons";
import "./TurnosPaciente.css";
import CustomDesplegable from "../../components/CustomDesplegable/CustomDesplegable";
import DialogoConfirmacion from "../../components/DialogoConfirmacion/DialogoConfirmacion";
import CustomToast from "../../components/CustomToast/CustomToast";
import LoadingBackdrop from "../../components/LoadingBackdrop/LoadingBackdrop";

export default function TurnosPaciente() {
  const [usuario, setUsuario] = useState({});
  const [cargando, setCargando] = useState(false);
  const [urlAxio, setUrlAxio] = useState("");
  const [tituloPagina, setTituloPagina] = useState("");
  const [especialidades, setEspecialidades] = useState([]);
  const [prestadores, setPrestadores] = useState([]);
  const [listadoPrestadores, setListadoPrestadores] = useState([]);
  const [especialidadSeleccionada, setEspecialidadSeleccionada] = useState(-1);
  const [prestadorSeleccionado, setPrestadorSeleccionado] = useState(-1);
  const [filtroCancelados, setFiltroCancelados] = useState(-1);
  const [filtroAsistidos, setFiltroAsistidos] = useState(-1);
  const [listadoTurnos, setListadoTurnos] = useState([]);
  const [listadoTurnosFiltrados, setListadoTurnosFiltrados] = useState([]);
  const [turnoSeleccionado, setTurnoSeleccionado] = useState({});
  const [abrirModalCancelarReserva, setAbrirModalCancelarReserva] =
    useState(false);
  const [cancelados, setCancelados] = useState([
    { codigo: true, text: "Cancelados" },
    { codigo: false, text: "No cancelados" },
  ]);
  const [asistidos, setAsistidos] = useState([
    { codigo: false, text: "No asistidos" },
    { codigo: true, text: "Asistidos" },
  ]);

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

  const traerTurnosPaciente = async (paciente) => {
    let turnos = null;
    const url = localStorage.getItem("urlAxio");
    const config = {
      headers: { Authorization: `Bearer ${paciente.token}` },
    };

    try {
      const servicio = await axios
        .get(`${url}Servicios`, config)
        .then((response) => {
          if (response.data.length !== 0) {
            return response.data;
          } else {
            return null;
          }
        });
      if (servicio !== null) {
        const response = await axios.get(
          `${url}Turnos/TurnosPaciente/?paciente=${paciente.codigo}&servicio=${servicio[0].codigo}`,
          config
        );
        if (response.data.length !== 0) {
          turnos = response.data;
        } else {
          turnos = null;
        }
        setListadoTurnos(turnos);
      }
    } catch (e) {
      mostrarNotificacion(
        true,
        "Ocurrió un problema al intentar consultar sus turnos registrados",
        "rojo"
      );
    }
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
      mostrarNotificacion(
        true,
        "Ocurrió un problema al intentar consultar las especialidades registradas",
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
        "Ocurrió un problema al intentar consultar los/las prestadores/as registradas",
        "rojo"
      );
    }
  };

  useEffect(() => {
    setCargando(true);
    try {
      const sesion = JSON.parse(sessionStorage.getItem("ppUL"));
      if (sesion !== {}) {
        traerTurnosPaciente(sesion);
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
        break;
      case "Prestador":
        prestadores.map((prestador) => {
          if (prestador.codigo === value) {
            handleChangeSelect(prestador.especialidad, "Especialidad");
          }
        });
        setPrestadorSeleccionado(value);
        break;
      case "Cancelados":
        setFiltroCancelados(value);
        break;
      case "Asistidos":
        setFiltroAsistidos(value);
        break;
      default:
        mostrarNotificacion(true, "Seleccion invalida", "rojo");
        break;
    }
  };

  const CancelarTurno = async () => {
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
        const cancelarTurnoResponse = await axios.patch(
          `${urlAxio}Turnos/Quitar/${turnoSeleccionado.codigo}`,
          "",
          config
        );

        if (
          cancelarTurnoResponse.status === 200 &&
          cancelarTurnoResponse.statusText === "OK"
        ) {
          mostrarNotificacion(
            true,
            "El turno se cancelo correctamente",
            "verde"
          );
        } else {
          mostrarNotificacion(
            true,
            "Ocurrió un problema al intentar cancelar el turno",
            "rojo"
          );
        }
      }
    } catch (error) {
      mostrarNotificacion(
        true,
        "Ocurrió un problema al intentar cancelar el turno",
        "rojo"
      );
    }
  };

  const FiltrarTurnos = (turnos) => {
    let listado = turnos || [];

    if (listado.length > 0) {
      if (especialidadSeleccionada !== -1) {
        listado = listado.filter(
          (turno) => especialidadSeleccionada === turno.especialidad
        );
      }
      if (prestadorSeleccionado !== -1) {
        listado = listado.filter(
          (turno) => prestadorSeleccionado === turno.prestadorCod
        );
      }
      if (filtroAsistidos !== -1) {
        listado = listado.filter((turno) => filtroAsistidos === turno.asistio);
      }
      if (filtroCancelados !== -1) {
        listado = listado.filter(
          (turno) => filtroCancelados === turno.aCancelar
        );
      }
    }

    return listado;
  };
  {
    /*Se buscaba filtrar las especialidades que se mostraban segun la de los turnos que se ven*/
  }
  // const FiltrarEspecialidadesXTurnos = (turnos, especialidades) => {
  //   let especialidadesFiltradas = [];
  //   if (turnos.length > 0) {
  //     turnos.map((turno) => {
  //       especialidadesFiltradas = especialidades.filter(
  //         (especialidad) => especialidad.codigo === turno.especialidad
  //       );
  //     });
  //   }
  //   return especialidadesFiltradas;
  // };

  const togleAbrirCerrarCancelarReserva = () => {
    if (abrirModalCancelarReserva) {
      setTurnoSeleccionado({});
      // handleChangeSelect(-1, "Especialidad");
    }
    setAbrirModalCancelarReserva(!abrirModalCancelarReserva);
  };

  const handleClickSeleccionarTurno = (turno) => {
    setTurnoSeleccionado(turno);
    togleAbrirCerrarCancelarReserva();
  };

  const handleClickCancelarReserva = async () => {
    togleAbrirCerrarCancelarReserva();
    setCargando(true);
    await CancelarTurno();
    await traerTurnosPaciente(usuario);
    setCargando(false);
  };
  return (
    <>
      {listadoTurnos.length <= 0 ? (
        <IonGrid>
          <IonRow className="ion-justify-content-center">
            <IonCol>
              <div class="ion-text-center">
                <p>No tiene turnos registrados</p>
              </div>
            </IonCol>
          </IonRow>
        </IonGrid>
      ) : (
        <>
          {/*Desplegable con filtros*/}
          <IonAccordionGroup expand="inset">
            <IonAccordion value={"a"}>
              <IonItem slot="header" color="light">
                <IonLabel>Filtrar</IonLabel>
              </IonItem>
              <div slot="content">
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
                  <IonRow>
                    <IonCol size="12" size-md="6">
                      <IonItem>
                        <CustomDesplegable
                          array={cancelados}
                          value={filtroCancelados}
                          handleChange={handleChangeSelect}
                          mostrarTodos={true}
                          label={"Cancelados"}
                          id="Cancelados"
                        />
                      </IonItem>
                    </IonCol>

                    <IonCol size="12" size-md="6">
                      <IonItem>
                        <CustomDesplegable
                          array={asistidos}
                          value={filtroAsistidos}
                          handleChange={handleChangeSelect}
                          mostrarTodos={true}
                          label={"Asistidos"}
                          id="Asistidos"
                        />
                      </IonItem>
                    </IonCol>
                  </IonRow>
                </IonGrid>
              </div>
            </IonAccordion>
          </IonAccordionGroup>

          {/* Tabla */}
          <IonList lines="none">
            <IonGrid>
              <IonItem className="fila cabecera">
                <IonCol className="celda cabecera" size="2.5">
                  <p>Fecha</p>
                </IonCol>
                <IonCol className="celda cabecera" size="3">
                  <p>Prestador</p>
                </IonCol>
                <IonCol className="celda cabecera" size="2">
                  <p>Mutual</p>
                </IonCol>
                <IonCol className="celda cabecera">
                  <p>Cancelado</p>
                </IonCol>
                <IonCol className="celda cabecera">
                  <p>Asistido</p>
                </IonCol>
                <IonCol className="celda cabecera">
                  <p>Acciones</p>
                </IonCol>
              </IonItem>
              {FiltrarTurnos(listadoTurnos).map((fila) => (
                <IonItem key={fila.nombre} className="fila">
                  <IonCol className="celda" size="2.5">
                    <p>{`${dayjs(fila.fecha).format("DD/MM/YYYY")} ${dayjs(
                      fila.hora
                    ).format("HH:MM")}`}</p>
                  </IonCol>
                  <IonCol className="celda" size="3">
                    <p>{fila.prestadorNom}</p>
                  </IonCol>
                  <IonCol className="celda" size="2">
                    <p>{fila.mutualNom}</p>
                  </IonCol>
                  <IonCol className="celda">
                    <p>{fila.aCancelar ? "Si" : "No"}</p>
                  </IonCol>
                  <IonCol className="celda">
                    <p>{fila.asistio ? "Si" : "No"}</p>
                  </IonCol>
                  <IonCol className="celda">
                    {dayjs(fila.fecha).isAfter(new dayjs()) ? (
                      // <div className="iconColumn">
                      <IonButton
                        shape="roud"
                        fill="clear"
                        onClick={() => handleClickSeleccionarTurno(fila)}
                      >
                        <IonIcon
                          size="large"
                          aria-label="Cancelar turno"
                          ios={closeOutline}
                          md={close}
                        />
                      </IonButton>
                    ) : // </div>
                    null}
                  </IonCol>
                </IonItem>
              ))}
            </IonGrid>
          </IonList>

          <DialogoConfirmacion
            titulo="Reservar turno"
            contenido={`Ha decidido cancelar el turno con el/la prestador/a ${
              turnoSeleccionado.prestadorNom
            }, con especialidad en ${
              turnoSeleccionado.especialidadNom
            }, para el dia ${dayjs(turnoSeleccionado.fecha).format(
              "DD/MM/YYYY"
            )}, a las ${dayjs(turnoSeleccionado.hora).format(
              "HH:mm"
            )}, ¿Esta seguro/a de ello?`}
            abrirCerrarModal={abrirModalCancelarReserva}
            handleclickBotonNo={togleAbrirCerrarCancelarReserva}
            handleclickBotonSi={handleClickCancelarReserva}
            colorBotonNo="amarillo"
            colorBotonSi="rojo"
            textoBotonNo="No"
            textoBotonSi="Si"
          />

          <CustomToast
            openToast={toast.open}
            onDidDismiss={(e) => mostrarNotificacion(false, "", "")}
            message={toast.mensaje}
            colorNotificacion={toast.tipo}
          />
        </>
      )}
      {cargando && <LoadingBackdrop visualizar={cargando} />}
    </>
  );
}
