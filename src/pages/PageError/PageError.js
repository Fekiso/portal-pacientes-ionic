import React, { useEffect, useState } from "react";
import "./PageError.css";
import {
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardTitle,
  IonCol,
  IonGrid,
  IonIcon,
  IonItem,
  IonRow,
  IonText,
  IonThumbnail,
} from "@ionic/react";
import LoadingBackdrop from "../../components/LoadingBackdrop/LoadingBackdrop";
import { useHistory } from "react-router";
import { alert, alertOutline } from "ionicons/icons";

const PageError = (props) => {
  let { motivo } = props;
  const [usuario, setUsuario] = useState(null);
  const [cargando, setCargando] = useState(false);
  const history = useHistory();

  useEffect(() => {
    setCargando(true);
    try {
      const sesion = JSON.parse(sessionStorage.getItem("ppUL"));
      if (sesion !== {}) {
        setUsuario(sesion);
      } else {
        motivo = "sesion perdida";
      }
    } catch (e) {
      console.log("Error: " + e.message);
    }
    document.title = "Ha ocurrido un error: " + motivo;
    setCargando(false);
  }, []);

  const handleClickRedirigir = (destino) => {
    switch (destino) {
      case "MainPage":
        history.push("/page/Main");
        break;
      case "CerrarSesion":
        history.push("/");
        break;
      default:
        break;
    }
  };

  return (
    <IonGrid type="overlay" contentId="main">
      <IonRow className="LoginViewRow justify-content-center">
        <IonCol>
          <IonCard>
            <IonCardHeader>
              <IonRow className="justify-content-center">
                <IonCardTitle>
                  <h1>Se ha producido un error</h1>
                </IonCardTitle>
              </IonRow>
            </IonCardHeader>
            <IonCardContent>
              <IonItem>
                <IonIcon
                  slot="start"
                  size="large"
                  color="danger"
                  ios={alertOutline}
                  md={alert}
                />
                <IonText color="danger">
                  {(!usuario || motivo === "sesion perdida") && (
                    <>
                      <h2>
                        {"Tu sesion ha expirado "}
                        <a href="/">
                          presiona aqui para redireccionarte al login
                        </a>
                      </h2>
                    </>
                  )}
                  {motivo === "404" && usuario?.codigo && (
                    <>
                      <h2>
                        No sabemos como pero has llegado a una ventana
                        inexitente\n
                        <a href="/page/">
                          presiona aqui para para redireccionarte a la pagina
                          principal
                        </a>
                      </h2>
                    </>
                  )}
                </IonText>
                <IonIcon
                  slot="end"
                  size="large"
                  color="danger"
                  ios={alertOutline}
                  md={alert}
                />
              </IonItem>
            </IonCardContent>
          </IonCard>
        </IonCol>
      </IonRow>

      {cargando && <LoadingBackdrop visualizar={cargando} />}
    </IonGrid>
  );
};

export default PageError;
