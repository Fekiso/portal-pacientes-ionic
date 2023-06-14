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
  const [horario, setHorario] = useState([]);
  const [horarios, setHorarios] = useState(null);

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
      const servicio = await axios.get(`${urlAxio}Servicios`, config).then((response) => {
        if (response.data.length !== 0) {
          return response.data;
        } else {
          return null;
        }
      });
      if (servicio !== null && prestador !== -1) {
        const response = await axios.get(`${urlAxio}PrestadoresHorarios/${prestador}`, config);
        if (response.data.length !== 0) {
          horarios = response.data[0];
        } else {
          horarios = [];
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
  const traerHorariosEspecialidad = async (prestadores) => {
    let arrayHorarios = [];
    let arrayHorariosMostrar = [];
    const config = {
      headers: { Authorization: `Bearer ${usuario.token}` },
    };

    try {
      const servicio = await axios.get(`${urlAxio}Servicios`, config).then((response) => {
        if (response.data.length !== 0) {
          return response.data;
        } else {
          return null;
        }
      });
      if (servicio !== null && prestadores.length > 0) {
        const response = await axios.get(`${urlAxio}PrestadoresHorarios`, config);
        if (response.data.length > 0) {
          arrayHorarios = response.data;
          arrayHorarios.forEach((horario) => {
            prestadores.map((prestador) => {
              if (prestador.codigo === horario.prestador) arrayHorariosMostrar.push(horario);
            });
          });
        } else {
          arrayHorarios = [];
        }
        setHorario(arrayHorariosMostrar);
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

      especialidades = especialidades.filter((especialidad) => especialidad.vigente === true);

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
        setHorario([]);
        setEspecialidadSeleccionada(value);
        if (value !== -1) {
          let arrayPrestadores = prestadores.filter(
            (prestador) => prestador.especialidad === value
          );
          setListadoPrestadores(arrayPrestadores);
          traerHorariosEspecialidad(arrayPrestadores);
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
        // traerHorariosPrestador(value);
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
            <IonCol size="12" size-md="12">
              <IonItem>
                <CustomDesplegable
                  array={especialidades}
                  value={especialidadSeleccionada}
                  handleChange={handleChangeSelect}
                  mostrarTodos={false}
                  mostrarSearch={true}
                  label={"Seleccione un tipo de especialidad"}
                  id="Especialidad"
                />
              </IonItem>
            </IonCol>
          </IonRow>
        </IonGrid>

        {/* Tabla por especialidad*/}
        <IonList lines="none">
          <IonGrid>
            <IonItem className="fila cabecera amarillo-sol">
              <IonCol className="celda cabecera">
                <p>Prestador</p>
              </IonCol>
              <IonCol className="celda cabecera">
                <p>L</p>
              </IonCol>
              <IonCol className="celda cabecera">
                <p>M</p>
              </IonCol>
              <IonCol className="celda cabecera">
                <p>X</p>
              </IonCol>
              <IonCol className="celda cabecera">
                <p>J</p>
              </IonCol>
              <IonCol className="celda cabecera">
                <p>V</p>
              </IonCol>
              <IonCol className="celda cabecera">
                <p>S</p>
              </IonCol>
              <IonCol className="celda cabecera">
                <p>D</p>
              </IonCol>
            </IonItem>
            {horario.length > 0 &&
              horario.map((prestador) => (
                <>
                  <IonItem className="fila amarillo-sol">
                    <IonCol className="celda">{prestador.prestadorNom}</IonCol>
                    <IonCol className="celda">
                      <>
                        {prestador.lunesM === ""
                          ? prestador.lunesT === ""
                            ? ""
                            : prestador.lunesT
                          : prestador.lunesM +
                            (prestador.lunesT === "" ? "" : " y " + prestador.lunesT)}
                      </>
                    </IonCol>
                    <IonCol className="celda">
                      <>
                        {prestador.martesM === ""
                          ? prestador.martesT === ""
                            ? ""
                            : prestador.martesT
                          : prestador.martesM +
                            (prestador.martesT === "" ? "" : " y " + prestador.martesT)}
                      </>
                    </IonCol>
                    <IonCol className="celda">
                      <>
                        {prestador.miercolesM === ""
                          ? prestador.miercolesT === ""
                            ? ""
                            : prestador.miercolesT
                          : prestador.miercolesM +
                            (prestador.miercolesT === "" ? "" : " y " + prestador.miercolesT)}
                      </>
                    </IonCol>
                    <IonCol className="celda">
                      <>
                        {prestador.juevesM === ""
                          ? prestador.juevesT === ""
                            ? ""
                            : prestador.juevesT
                          : prestador.juevesM +
                            (prestador.juevesT === "" ? "" : " y " + prestador.juevesT)}
                      </>
                    </IonCol>
                    <IonCol className="celda">
                      <>
                        {prestador.viernesM === ""
                          ? prestador.viernesT === ""
                            ? ""
                            : prestador.viernesT
                          : prestador.viernesM +
                            (prestador.viernesT === "" ? "" : " y " + prestador.viernesT)}
                      </>
                    </IonCol>
                    <IonCol className="celda">
                      <>
                        {prestador.sabadoM === ""
                          ? prestador.sabadoT === ""
                            ? ""
                            : prestador.sabadoT
                          : prestador.sabadoM +
                            (prestador.sabadoT === "" ? "" : " y " + prestador.sabadoT)}
                      </>
                    </IonCol>
                    <IonCol className="celda">
                      <>
                        {prestador.domingoM === ""
                          ? prestador.domingoT === ""
                            ? ""
                            : prestador.domingoT
                          : prestador.domingoM +
                            (prestador.domingoT === "" ? "" : " y " + prestador.domingoT)}
                      </>
                    </IonCol>
                  </IonItem>
                </>
              ))}
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
