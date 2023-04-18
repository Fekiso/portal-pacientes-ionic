import {
  IonContent,
  IonIcon,
  IonItem,
  IonLabel,
  IonList,
  IonListHeader,
  IonMenu,
  IonMenuToggle,
  IonNote,
} from "@ionic/react";

import { useHistory, useLocation } from "react-router-dom";
import {
  calendarOutline,
  calendar,
  peopleOutline,
  people,
  fileTrayFullOutline,
  fileTrayFull,
  calendarNumberOutline,
  calendarNumber,
  logOutOutline,
  logOut,
  gridOutline,
  grid,
} from "ionicons/icons";
import "./Menu.css";
import { useEffect, useState } from "react";

const appPages = [
  {
    title: "Inicio",
    url: "/page/Inicio",
    iosIcon: gridOutline,
    mdIcon: grid,
  },
  {
    title: "Reservar Turno",
    url: "/page/Reservar",
    iosIcon: calendarNumberOutline,
    mdIcon: calendarNumber,
  },
  {
    title: "Horarios Prestadores",
    url: "/page/Horarios",
    iosIcon: peopleOutline,
    mdIcon: people,
  },
  {
    title: "Mis Turnos",
    url: "/page/Turnos",
    iosIcon: calendarOutline,
    mdIcon: calendar,
  },
  {
    title: "Mis Estudios",
    url: "/page/Estudios",
    iosIcon: fileTrayFullOutline,
    mdIcon: fileTrayFull,
  },
];

const Menu = () => {
  const location = useLocation();
  const [usuario, setUsuario] = useState({});
  const history = useHistory();
  useEffect(() => {
    try {
      setUsuario(JSON.parse(sessionStorage.getItem("ppUL")));
    } catch {
      history.push({ pathname: "/ErrorPage" });
    }
  }, []);

  return (
    <IonMenu contentId="main" type="overlay">
      <IonContent>
        <IonList id="inbox-list">
          <IonListHeader>
            {usuario.apellido}, {usuario.nombre}
          </IonListHeader>
          <IonNote>{usuario.email}</IonNote>
          {appPages.map((appPage, index) => {
            return (
              <IonMenuToggle key={index} autoHide={false}>
                <IonItem
                  className={
                    location.pathname === appPage.url ? "selected" : ""
                  }
                  routerLink={appPage.url}
                  routerDirection="none"
                  lines="none"
                  detail={false}
                >
                  <IonIcon
                    aria-hidden="true"
                    slot="start"
                    ios={appPage.iosIcon}
                    md={appPage.mdIcon}
                  />
                  <IonLabel>{appPage.title}</IonLabel>
                </IonItem>
              </IonMenuToggle>
            );
          })}
        </IonList>
        <IonList id="inbox-list">
          <IonItem button fill="solid" lines="none" routerLink={"/"}>
            <IonLabel color="danger">Cerrar Sesion</IonLabel>
            <IonIcon
              aria-hidden="true"
              slot="end"
              ios={logOutOutline}
              md={logOut}
            />
          </IonItem>
        </IonList>
      </IonContent>
    </IonMenu>
  );
};

export default Menu;
