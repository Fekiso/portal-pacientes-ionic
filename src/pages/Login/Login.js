import {
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
import "./login.css";

const LoginIonic = () => {
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
  const [cargandoLogin, setCargandoLogin] = useState(false);
  const [registrarPaciente, setRegistrarPaciente] = useState(false);
  const history = useHistory()


  const handleChangeVisibilityOfPassword = () => {
    setBlnVerPassword(!blnVerPassword);
  };

  useEffect(() => {
    setUrlAxio(localStorage.getItem("urlAxio"));
    setTituloPagina(localStorage.getItem("nombreClinica"));

    document.title = localStorage.getItem("tituloWeb");
    sessionStorage.setItem("ppUL", {});
  }, []);

  const LoginUsuario = async () => {
    let LoginUsuario = {};
    let LoginUsuarioEstado = 0;
    let LoginUsuarioToken = "";

    await axios
      .post(`${urlAxio}Usuarios/LoginPaciente`, {
        nombreUsuario: usuario.usuario,
        password: usuario.password,
      })
      .then((res) => {
        LoginUsuarioEstado = res.status;
        LoginUsuarioToken = res.data.token;
      })
      .catch((err) => {
        console.log("error");
        console.log(err.response);
      });

    let config = {
      headers: { Authorization: `Bearer ${LoginUsuarioToken}` },
    };

    await axios
      .get(`${urlAxio}Pacientes?documento=${usuario.usuario}`, config)
      .then((res) => {
        LoginUsuario["usuario"] = usuario.usuario;
        LoginUsuario["password"] = usuario.password;
        LoginUsuario["token"] = LoginUsuarioToken;
        LoginUsuario["codigo"] = res.data[0].codigo;
        LoginUsuario["hc"] = res.data[0].hc;
        LoginUsuario["documentoNro"] = res.data[0].documentoNro;
        LoginUsuario["documentoTipo"] = res.data[0].documentoTipo;
        LoginUsuario["documentoTipoNombre"] = res.data[0].documentoTipoNombre;
        LoginUsuario["nombre"] = res.data[0].nombre;
        LoginUsuario["apellido"] = res.data[0].apellido;
        LoginUsuario["mutual"] = res.data[0].mutual;
        LoginUsuario["mutualNombre"] = res.data[0].mutualNombre;
        LoginUsuario["telefono"] = res.data[0].telefono;
        LoginUsuario["celular"] = res.data[0].celular;
        LoginUsuario["email"] = res.data[0].email;
        LoginUsuario["mutualAfiliado"] = res.data[0].mutualAfiliado;
        LoginUsuario["nacimiento"] = res.data[0].nacimiento;
        LoginUsuario["password"] = res.data[0].password;
      })
      .catch((e) => {
        console.log("Error");
        console.log(e.response);
      })
      .then(() => {
        if (LoginUsuarioEstado === 200) {
          setCargandoLogin(false);
          setUsuario(LoginUsuario);
          sessionStorage.setItem("ppUL", JSON.stringify(LoginUsuario));
          history.push('/page/')
        } else {
          setErrorPassword(true);
          setMsjErrorPassword("Usuario o Password incorrecto");
          setCargandoLogin(false);
        }
      });
  };

  const handleClickLogin = () => {
    if (usuario.usuario !== "" && usuario.password !== "") LoginUsuario();
    else {
      if (usuario.usuario !== "") setErrorUsuario(true);
      if (usuario.password !== "") {
        setErrorPassword(true);
        setMsjErrorPassword("Debe ingresar su contraseña");
        setCargandoLogin(false);
      }
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setCargandoLogin(true);
    handleClickLogin();
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
                <IonItem lines="none" fill="solid">
                  <IonLabel position="floating">Nro de documento</IonLabel>
                  <IonIcon
                    aria-hidden="true"
                    slot="start"
                    ios={helpOutline}
                    md={help}
                    id="btnHelpNrodocumento"
                    size="small"
                  />
                  <IonPopover
                    trigger="btnHelpNrodocumento"
                    triggerAction="click"
                  >
                    <IonContent class="ion-padding">
                      Solo se aceptan valores numericos
                    </IonContent>
                  </IonPopover>
                  <IonInput
                    value={usuario.usuario}
                    onIonChange={handleChangeUsuario}
                    autofocus
                    inputMode="numeric"
                  />
                  <IonIcon
                    aria-hidden="true"
                    slot="end"
                    ios={personOutline}
                    md={person}
                  />
                </IonItem>
                <IonItem
                  lines="none"
                  fill="solid"
                  className={`${errorPassword && "ion-invalid"}`}
                >
                  <IonLabel position="floating">Contraseña</IonLabel>
                  <IonIcon
                    aria-hidden="true"
                    slot="start"
                    ios={helpOutline}
                    md={help}
                    id="btnHelpPassword"
                    size="small"
                  />
                  <IonPopover trigger="btnHelpPassword" triggerAction="click">
                    <IonContent class="ion-padding">
                      Si es su primera vez ingresando, ingrese su numero de
                      documento
                    </IonContent>
                  </IonPopover>
                  <IonInput
                    value={usuario.password}
                    onIonChange={handleChangePassword}
                    type={blnVerPassword ? "number" : "password"}
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
                className="violeta justify-content-center"
                onClick={handleSubmit}
              >
                Ingresar
              </StyledButton>
              <StyledButton
                lines="none"
                fill="clear"
                className="justify-content-center"
              >
                <h5>¿No es paciente?, REGISTRESE</h5>
              </StyledButton>
            </IonCardContent>
          </IonCard>
        </IonCol>
      </IonRow>
    </IonGrid>
  );
};

export default LoginIonic;
