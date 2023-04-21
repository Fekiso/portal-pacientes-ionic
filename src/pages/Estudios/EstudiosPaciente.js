import React, { useEffect, useRef, useState } from "react";
import { useHistory } from "react-router";
import axios from "axios";
import dayjs from "dayjs";
import "dayjs/locale/es";
import fileDownload from "js-file-download";

import {
  IonAccordion,
  IonAccordionGroup,
  IonActionSheet,
  IonButton,
  IonButtons,
  IonCol,
  IonContent,
  IonGrid,
  IonHeader,
  IonIcon,
  IonItem,
  IonLabel,
  IonList,
  IonModal,
  IonRow,
  IonTitle,
  IonToolbar,
} from "@ionic/react";

import {
  cloudDownload,
  cloudDownloadOutline,
  eye,
  eyeOutline,
} from "ionicons/icons";
import "./EstudiosPaciente.css";

import { Document, Page, pdfjs } from "react-pdf";
import "react-pdf/dist/esm/Page/TextLayer.css";
import CustomDesplegable from "../../components/CustomDesplegable/CustomDesplegable";
import CustomToast from "../../components/CustomToast/CustomToast";
import LoadingBackdrop from "../../components/LoadingBackdrop/LoadingBackdrop";
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.js`;

export default function EstudiosPaciente() {
  const [usuario, setUsuario] = useState({});
  const [cargando, setCargando] = useState(false);
  const [tituloPagina, setTituloPagina] = useState("");
  const [urlAxio, setUrlAxio] = useState("");
  const [listadoEstudios, setListadoEstudios] = useState([]);
  const [listadoEstudiosFiltrados, setListadoEstudiosFiltrados] = useState([]);
  const [estudioSel, setEstudioSel] = useState(-1);
  const [listadoEstudiosFiltro, setListadoEstudiosFiltro] = useState([]);
  const [estudioPdf, setEstudioPdf] = useState({
    fecha: "",
    nombre: "",
    doc: {},
  });
  const [abrirModal, setAbrirModal] = useState(false);

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

  const abrirCerrarModal = () => setAbrirModal(!abrirModal);

  const traerEstudiosPaciente = async (paciente) => {
    let Estudios = null;
    const url = localStorage.getItem("urlAxio");
    const config = {
      headers: { Authorization: `Bearer ${paciente.token}` },
    };

    try {
      const response = await axios.get(
        `${url}EstudiosImagenes/${paciente.codigo}`,
        config
      );
      if (response.data.length !== 0) {
        Estudios = response.data;
      } else {
        Estudios = [];
      }

      setListadoEstudios(Estudios);
      setListadoEstudiosFiltrados(Estudios);
      Estudios = Estudios.filter(
        (item, index, self) =>
          index === self.findIndex((t) => t.estudioCod === item.estudioCod)
      );
      Estudios = Estudios.map((estudio) => {
        return {
          ...estudio,
          codigo: estudio.estudioCod,
          text: estudio.estudioNom,
        };
      });
      setListadoEstudiosFiltro(Estudios);
    } catch ({response}) {
      mostrarNotificacion(true, "Error: " + response.data, "rojo");
    }
  };

  const FiltrarEstudios = (value) => {
    setCargando(true);
    if (value !== -1) {
      let listado = [];

      listadoEstudios.map((estudio) => {
        if (parseInt(value) === estudio.estudioCod) {
          listado.push(estudio);
        }
      });
      setEstudioSel(value);
      setListadoEstudiosFiltrados(listado);
    } else {
      setEstudioSel(value);
      setListadoEstudiosFiltrados(listadoEstudios);
    }
    setCargando(false);
  };

  const BuscarEstudio = async (estudio, pdfDoc, pdfUrl) => {
    try {
      const response = await axios.request({
        url: `${urlAxio}EstudiosImagenes/DescargarPdf/${estudio.estudioPacienteDocumento_Codigo}`,
        method: "GET",
        responseType: "blob",
        auth: `Bearer ${usuario.token}`,
      });

      if (response.data.size > 0) {
        const pdfBlob = new Blob([response.data]);
        if (pdfDoc && !pdfUrl) {
          fileDownload(
            pdfBlob,
            `${estudio.estudioNom}-${dayjs(estudio.fecha).format(
              "DD/MM/YYYY"
            )}.pdf`
          );
        } else {
          if (!pdfDoc && pdfUrl) {
            setEstudioPdf({
              fecha: estudio.fecha,
              nombre: estudio.estudioNom,
              doc: pdfBlob,
            });
            abrirCerrarModal();
          }
        }
      }
    } catch (error) {
      console.log(error);
      mostrarNotificacion(
        true,
        "Ha ocurrido un error al intentar buscar el estudio seleccionado",
        "rojo"
      );
    }

    return null;
  };

  const DescargarPdf = (estudio) => {
    setCargando(true);
    if (estudio) {
      BuscarEstudio(estudio, true, false);
    } else {
      mostrarNotificacion(true, "Estudio sin archivo guardado", "rojo");
    }
    setCargando(false);
  };
  const VisualizarPdf = (estudio) => {
    setCargando(true);
    if (estudio) {
      BuscarEstudio(estudio, false, true);
    } else {
      mostrarNotificacion(true, "Estudio sin archivo guardado", "rojo");
    }
    setCargando(false);
  };

  useEffect(() => {
    setCargando(true);
    try {
      const sesion = JSON.parse(sessionStorage.getItem("ppUL"));
      if (sesion !== {}) {
        traerEstudiosPaciente(sesion);
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

  //cosas para el modal
  const [numPages, setNumPages] = React.useState(null);
  function onDocumentLoadSuccess({ numPages }) {
    setNumPages(numPages);
  }

  return (
    <>
      {listadoEstudios.length <= 0 ? (
        <IonGrid>
          <IonRow className="ion-justify-content-center">
            <IonCol>
              <div class="ion-text-center">
                <p>No tiene estudios registrados aun</p>
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
                          array={listadoEstudiosFiltro}
                          value={estudioSel}
                          handleChange={FiltrarEstudios}
                          mostrarTodos={true}
                          mostrarSearch={true}
                          label={"Seleccione un tipo de estudio"}
                          id="Estudios"
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
                <IonCol className="celda cabecera">
                  <p>Fecha</p>
                </IonCol>
                <IonCol className="celda cabecera">
                  <p>Nombre de estudio</p>
                </IonCol>
                <IonCol className="celda cabecera">
                  <p>Estudio</p>
                </IonCol>
              </IonItem>
              {listadoEstudiosFiltrados.map((fila) => (
                <IonItem key={fila.nombre} className="fila">
                  <IonCol className="celda">
                    <p>{dayjs(fila.fecha).format("DD/MM/YYYY")}</p>
                  </IonCol>
                  <IonCol className="celda">
                    <p>{fila.estudioNom}</p>
                  </IonCol>
                  <IonCol className="celda" itemProp="">
                    <div className="iconColumn">
                      <IonButton
                        shape="roud"
                        fill="clear"
                        onClick={() => VisualizarPdf(fila)}
                      >
                        <IonIcon size="large" ios={eyeOutline} md={eye} />
                      </IonButton>
                      <IonButton
                        shape="roud"
                        fill="clear"
                        onClick={() => DescargarPdf(fila)}
                      >
                        <IonIcon
                          size="large"
                          ios={cloudDownloadOutline}
                          md={cloudDownload}
                        />
                      </IonButton>
                    </div>
                  </IonCol>
                </IonItem>
              ))}
            </IonGrid>
          </IonList>

          <IonActionSheet
            header={`${estudioPdf.nombre}-${dayjs(estudioPdf.fecha).format(
              "DD/MM/YYYY"
            )}`}
            buttons={[
              {
                text: "Cancelar",
                role: "cancel",
                data: {
                  action: "cancel",
                },
              },
            ]}
            onDidDismiss={abrirCerrarModal}
          >
            <IonContent className="ion-padding">
              {estudioPdf.doc && (
                <Document
                  file={estudioPdf.doc}
                  onLoadSuccess={onDocumentLoadSuccess}
                >
                  {[...Array(numPages)].map((_, index) => (
                    <Page
                      key={`page_${index + 1}`}
                      pageNumber={1}
                      renderTextLayer={false}
                      wrap={false}
                    />
                  ))}
                </Document>
              )}
            </IonContent>
          </IonActionSheet>
          <IonModal isOpen={abrirModal} backdropDismiss={false} expand="block">
            <IonHeader>
              <IonToolbar>
                <IonTitle>
                  {`${estudioPdf.nombre}-${dayjs(estudioPdf.fecha).format(
                    "DD/MM/YYYY"
                  )}`}
                </IonTitle>
                <IonButtons slot="end">
                  <IonButton strong={true} onClick={() => abrirCerrarModal()}>
                    Cerrar
                  </IonButton>
                </IonButtons>
              </IonToolbar>
            </IonHeader>
            <IonContent className="ion-padding">
              {estudioPdf.doc && (
                <Document
                  file={estudioPdf.doc}
                  onLoadSuccess={onDocumentLoadSuccess}
                >
                  {[...Array(numPages)].map((_, index) => (
                    <Page
                      key={`page_${index + 1}`}
                      pageNumber={1}
                      renderTextLayer={false}
                      wrap={false}
                    />
                  ))}
                </Document>
              )}
            </IonContent>
          </IonModal>
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
