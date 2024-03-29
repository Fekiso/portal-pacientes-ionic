import {
  IonButton,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardTitle,
  IonCol,
  IonContent,
  IonGrid,
  IonIcon,
  IonInput,
  IonItem,
  IonLabel,
  IonList,
  IonPopover,
  IonRow,
} from "@ionic/react";
import axios from "axios";
import {
  eye,
  eyeOff,
  eyeOffOutline,
  eyeOutline,
  help,
  helpOutline,
  person,
  personOutline,
} from "ionicons/icons";
import React, { useEffect, useState } from "react";
import { useHistory } from "react-router";
import StyledButton from "../../components/StyledButton/StyledButton";
import NuevoPaciente from "../NuevoPaciente/NuevoPaciente";
import CustomToast from "../../components/CustomToast/CustomToast";
import LoadingBackdrop from "../../components/LoadingBackdrop/LoadingBackdrop";

const LoginIonic = () => {
  const [cargando, setCargando] = useState(false);
  const [blnVerPassword, setBlnVerPassword] = useState(false);
  const [usuario, setUsuario] = useState({
    usuario: "",
    password: "",
    token: "",
  });
  const [urlAxio, setUrlAxio] = useState("");
  const [tituloPagina, setTituloPagina] = useState("");
  const [errorUsuario, setErrorUsuario] = useState(false);
  const [errorPassword, setErrorPassword] = useState(false);
  const [msjErrorPassword, setMsjErrorPassword] = useState("");
  const [registrarPaciente, setRegistrarPaciente] = useState(false);
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

  const handleChangeVisibilityOfPassword = () => {
    setBlnVerPassword(!blnVerPassword);
  };

  useEffect(() => {
    setUrlAxio(localStorage.getItem("urlAxio"));
    setTituloPagina(localStorage.getItem("nombreClinica"));

    document.title = localStorage.getItem("tituloWeb");
    sessionStorage.setItem("ppUL", {});
  }, []);

  const loginPaciente = async (usuario, password) => {
    try {
      const response = await axios.post(`${urlAxio}Usuarios/LoginPaciente`, {
        nombreUsuario: usuario,
        password: password,
      });
      return response.data.token;
    } catch (error) {
      setErrorPassword(true);
      setMsjErrorPassword("Usuario o Password incorrecto");
      mostrarNotificacion(true, "Error: " + error.response.data, "rojo");
    }
  };

  const obtenerPaciente = async (token, documento) => {
    try {
      const config = {
        headers: { Authorization: `Bearer ${token}` },
      };
      const response = await axios.get(`${urlAxio}Pacientes?documento=${documento}`, config);
      const data = response.data[0];
      return {
        usuario: usuario.usuario,
        password: usuario.password,
        token: token,
        codigo: data.codigo,
        hc: data.hc,
        documentoNro: data.documentoNro,
        documentoTipo: data.documentoTipo,
        documentoTipoNombre: data.documentoTipoNombre,
        nombre: data.nombre,
        apellido: data.apellido,
        mutual: data.mutual,
        mutualNombre: data.mutualNombre,
        telefono: data.telefono,
        celular: data.celular,
        email: data.email,
        mutualAfiliado: data.mutualAfiliado,
        nacimiento: data.nacimiento,
      };
    } catch (error) {
      console.error("Error en petición obtenerPaciente", error.response);
      mostrarNotificacion(
        true,
        "Se produjo un error al intentar consultar los datos del paciente",
        "rojo"
      );
    }
  };

  const handleClickLogin = async () => {
    setCargando(true);
    if (usuario.usuario !== "" && usuario.password !== "") {
      const token = await loginPaciente(usuario.usuario, usuario.password);
      const paciente = await obtenerPaciente(token, usuario.usuario);
      if (paciente) {
        mostrarNotificacion(true, "Sesión iniciada correctamente", "verde");
        setUsuario(paciente);
        sessionStorage.setItem("ppUL", JSON.stringify(paciente));
        history.push("/page/");
      }
    } else {
      if (usuario.usuario !== "") setErrorUsuario(true);
      if (usuario.password !== "") {
        setErrorPassword(true);
        setMsjErrorPassword("Debe ingresar su contraseña");
      }
    }
    setCargando(false);
  };

  const handleClickSubmit = () => {
    setCargando(true);
    handleClickLogin();
    setCargando(false);
  };

  const handleChangeUsuario = (e) => {
    const value = e.target.value;
    //Reemplazamos los valores no numericos por espacios en blanco
    const filteredValue = value.replace(/[^0-9]+/g, "");
    setUsuario({ usuario: filteredValue, password: usuario.password });
  };

  const handleChangePassword = (e) => {
    const value = e.target.value;
    //Reemplazamos los valores no numericos por espacios en blanco
    const filteredValue = value.replace(/[^0-9]+/g, "");
    setUsuario({ usuario: usuario.usuario, password: filteredValue });
  };

  const handleCloseModalRegistrarPaciente = () => {
    setRegistrarPaciente(false);
  };

  return (
    <IonGrid type="overlay" contentId="main">
      <IonRow className="LoginViewRow justify-content-center">
        <IonCol>
          <IonCard>
            <IonCardHeader>
              <IonRow className="justify-content-center">
                <IonCardTitle>
                  <h1>Inicio de sesion</h1>
                </IonCardTitle>
              </IonRow>
            </IonCardHeader>
            <IonCardContent>
              <IonList>
                <IonItem lines="none" fill="solid" className="amarillo-sol">
                  <IonLabel position="floating">Nro de documento</IonLabel>
                  <IonIcon
                    aria-hidden="true"
                    slot="start"
                    ios={helpOutline}
                    md={help}
                    id="btnHelpNrodocumento"
                    size="small"
                  />
                  <IonPopover trigger="btnHelpNrodocumento" triggerAction="click">
                    <IonContent className="ion-padding">
                      Solo se aceptan valores numericos
                    </IonContent>
                  </IonPopover>
                  <IonInput
                    value={usuario.usuario}
                    onKeyUp={handleChangeUsuario}
                    autofocus
                    inputMode="numeric"
                  />
                  <IonIcon aria-hidden="true" slot="end" ios={personOutline} md={person} />
                </IonItem>
                <IonItem
                  lines="none"
                  fill="solid"
                  className={`amarillo-sol ${errorPassword && "ion-invalid"}`}
                >
                  <IonLabel position="floating">Contraseña</IonLabel>

                  <IonIcon
                    aria-hidden="true"
                    ios={helpOutline}
                    md={help}
                    id="btnHelpPassword"
                    size="small"
                    slot="start"
                  />
                  <IonPopover trigger="btnHelpPassword" triggerAction="click">
                    <IonContent className="ion-padding">
                      Si es su primera vez ingresando, ingrese su numero de documento
                    </IonContent>
                  </IonPopover>
                  <IonInput
                    value={usuario.password}
                    onKeyUp={handleChangePassword}
                    type={blnVerPassword ? "number" : "password"}
                    className="passwordInput"
                  />
                  <IonIcon
                    aria-hidden="true"
                    slot="end"
                    ios={blnVerPassword ? eyeOutline : eyeOffOutline}
                    md={blnVerPassword ? eye : eyeOff}
                    onClick={handleChangeVisibilityOfPassword}
                  />
                  <ion-note slot="error">{msjErrorPassword}</ion-note>
                </IonItem>
              </IonList>
              <StyledButton
                lines="none"
                size="large"
                className="amarillo-sol justify-content-center"
                onClick={handleClickSubmit}
              >
                Ingresar
              </StyledButton>
              <StyledButton
                lines="none"
                fill="clear"
                className="justify-content-center amarillo-sol-text"
                onClick={(e) => setRegistrarPaciente(true)}
              >
                <h5>¿No es paciente?, REGISTRESE</h5>
              </StyledButton>
            </IonCardContent>
          </IonCard>
        </IonCol>
      </IonRow>

      <NuevoPaciente
        mostrarNotificacion={mostrarNotificacion}
        openModal={registrarPaciente}
        closeModal={handleCloseModalRegistrarPaciente}
      />

      <CustomToast
        openToast={toast.open}
        onDidDismiss={(e) => mostrarNotificacion(false, "", "")}
        message={toast.mensaje}
        colorNotificacion={toast.tipo}
      />

      {cargando && <LoadingBackdrop visualizar={cargando} />}
    </IonGrid>
  );
};

export default LoginIonic;
