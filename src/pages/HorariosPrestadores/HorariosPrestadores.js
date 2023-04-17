import React, { useEffect, useState } from "react";
import { useHistory } from "react-router";
import axios from "axios";
import dayjs from "dayjs";
import "dayjs/locale/es";
import {
  IonAccordion,
  IonAccordionGroup,
  IonCol,
  IonGrid,
  IonIcon,
  IonItem,
  IonLabel,
  IonList,
  IonRow,
} from "@ionic/react";

import { close, closeOutline } from "ionicons/icons";
import "./HorariosPrestadores.css";
import CustomDesplegable from "../../components/CustomDesplegable/CustomDesplegable";
import LoadingBackdrop from "../../components/LoadingBackdrop/LoadingBackdrop";
import CustomToast from "../../components/CustomToast/CustomToast";

export default function HorariosPrestadores() {
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
      mostrarNotificacion(
        true,
        "Ha ocurrido un error al intentar cargar los horarios del prestador",
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
        "Ha ocurrido un error al intentar cargar las especialidades registradas",
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
        "Ha ocurrido un error al intentar cargar los/las prestadores/as registrados/as",
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

  const handleChangeSelect = (value, select) => {
    setCargando(true);
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
        mostrarNotificacion(true, "Seleccion invalida", "rojo");
        break;
    }
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

        {/* Tabla */}
        <IonList lines="none">
          <IonGrid>
            <IonItem className="fila cabecera">
              <IonCol className="celda cabecera" size="2">
                <p>Dia</p>
              </IonCol>
              <IonCol className="celda cabecera" size="5">
                <p>Horarios</p>
              </IonCol>
              <IonCol className="celda cabecera" size="5">
                <p>Virtual</p>
              </IonCol>
            </IonItem>
            {horario ? (
              <>
                <IonItem className="fila">
                  <IonCol className="celda" size="2">
                    <p>Domingo</p>
                  </IonCol>
                  <IonCol className="celda" size="5">
                    <p>
                      {horario.domingoM === ""
                        ? horario.domingoT === ""
                          ? ""
                          : horario.domingoT
                        : horario.domingoM +
                          (horario.domingoT === ""
                            ? ""
                            : " y " + horario.domingoT)}
                    </p>
                  </IonCol>
                  <IonCol className="celda" size="5">
                    <p>
                      {horario.domMEsVirtual === 0
                        ? horario.domTEsVirtual === 0
                          ? "No"
                          : "Tarde"
                        : horario.domTEsVirtual === 0
                        ? "Mañana"
                        : "Mañana y tarde"}
                    </p>
                  </IonCol>
                </IonItem>
                <IonItem className="fila">
                  <IonCol className="celda" size="2">
                    <p>Lunes</p>
                  </IonCol>
                  <IonCol className="celda" size="5">
                    <p>
                      {horario.lunesM === ""
                        ? horario.lunesT === ""
                          ? ""
                          : horario.lunesT
                        : horario.lunesM +
                          (horario.lunesT === "" ? "" : " y " + horario.lunesT)}
                    </p>
                  </IonCol>
                  <IonCol className="celda" size="5">
                    <p>
                      {horario.lunMEsVirtual === 0
                        ? horario.lunTEsVirtual === 0
                          ? "No"
                          : "Tarde"
                        : horario.lunTEsVirtual === 0
                        ? "Mañana"
                        : "Mañana y tarde"}
                    </p>
                  </IonCol>
                </IonItem>
                <IonItem className="fila">
                  <IonCol className="celda" size="2">
                    <p>Martes</p>
                  </IonCol>
                  <IonCol className="celda" size="5">
                    <p>
                      {horario.martesM === ""
                        ? horario.martesT === ""
                          ? ""
                          : horario.martesT
                        : horario.martesM +
                          (horario.martesT === ""
                            ? ""
                            : " y " + horario.martesT)}
                    </p>
                  </IonCol>
                  <IonCol className="celda" size="5">
                    <p>
                      {horario.marMEsVirtual === 0
                        ? horario.marTEsVirtual === 0
                          ? "No"
                          : "Tarde"
                        : horario.marTEsVirtual === 0
                        ? "Mañana"
                        : "Mañana y tarde"}
                    </p>
                  </IonCol>
                </IonItem>
                <IonItem className="fila">
                  <IonCol className="celda" size="2">
                    <p>Miercoles</p>
                  </IonCol>
                  <IonCol className="celda" size="5">
                    <p>
                      {horario.miercolesM === ""
                        ? horario.miercolesT === ""
                          ? ""
                          : horario.miercolesT
                        : horario.miercolesM +
                          (horario.miercolesT === ""
                            ? ""
                            : " y " + horario.miercolesT)}
                    </p>
                  </IonCol>
                  <IonCol className="celda" size="5">
                    <p>
                      {horario.mieMEsVirtual === 0
                        ? horario.mieTEsVirtual === 0
                          ? "No"
                          : "Tarde"
                        : horario.mieTEsVirtual === 0
                        ? "Mañana"
                        : "Mañana y tarde"}
                    </p>
                  </IonCol>
                </IonItem>
                <IonItem className="fila">
                  <IonCol className="celda" size="2">
                    <p>Jueves</p>
                  </IonCol>
                  <IonCol className="celda" size="5">
                    <p>
                      {horario.juevesM === ""
                        ? horario.juevesT === ""
                          ? ""
                          : horario.juevesT
                        : horario.juevesM +
                          (horario.juevesT === ""
                            ? ""
                            : " y " + horario.juevesT)}
                    </p>
                  </IonCol>
                  <IonCol className="celda" size="5">
                    <p>
                      {horario.jueMEsVirtual === 0
                        ? horario.jueTEsVirtual === 0
                          ? "No"
                          : "Tarde"
                        : horario.jueTEsVirtual === 0
                        ? "Mañana"
                        : "Mañana y tarde"}
                    </p>
                  </IonCol>
                </IonItem>
                <IonItem className="fila">
                  <IonCol className="celda" size="2">
                    <p>Viernes</p>
                  </IonCol>
                  <IonCol className="celda" size="5">
                    <p>
                      {horario.viernesM === ""
                        ? horario.viernesT === ""
                          ? ""
                          : horario.viernesT
                        : horario.viernesM +
                          (horario.viernesT === ""
                            ? ""
                            : " y " + horario.viernesT)}
                    </p>
                  </IonCol>
                  <IonCol className="celda" size="5">
                    <p>
                      {horario.vieMEsVirtual === 0
                        ? horario.vieTEsVirtual === 0
                          ? "No"
                          : "Tarde"
                        : horario.vieTEsVirtual === 0
                        ? "Mañana"
                        : "Mañana y tarde"}
                    </p>
                  </IonCol>
                </IonItem>
                <IonItem className="fila">
                  <IonCol className="celda" size="2">
                    <p>Sabado</p>
                  </IonCol>
                  <IonCol className="celda" size="5">
                    <p>
                      {horario.sabadoM === ""
                        ? horario.sabadoT === ""
                          ? ""
                          : horario.sabadoT
                        : horario.sabadoM +
                          (horario.sabadoT === ""
                            ? ""
                            : " y " + horario.sabadoT)}
                    </p>
                  </IonCol>
                  <IonCol className="celda" size="5">
                    <p>
                      {horario.sabMEsVirtual === 0
                        ? horario.sabTEsVirtual === 0
                          ? "No"
                          : "Tarde"
                        : horario.sabTEsVirtual === 0
                        ? "Mañana"
                        : "Mañana y tarde"}
                    </p>
                  </IonCol>
                </IonItem>
              </>
            ) : null}
          </IonGrid>
        </IonList>
      </div>

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
