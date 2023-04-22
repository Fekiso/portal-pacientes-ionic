import { useEffect, useState } from "react";
import { IonToast } from "@ionic/react";
import {
  alertOutline,
  checkmarkOutline,
  closeOutline,
  informationOutline,
  warningOutline,
} from "ionicons/icons";
import "./CustomToast.css";

function CustomToast({ openToast, onDidDismiss, message, colorNotificacion }) {
  const [color, setColor] = useState("");
  const [icon, setIcon] = useState();
  const getColor = () => {
    switch (colorNotificacion) {
      case "verde":
        return "success";
      case "rojo":
        return "danger";
      case "amarillo":
        return "warning";
      default:
        return "primary";
    }
  };
  const getIcon = () => {
    switch (colorNotificacion) {
      case "verde":
        return checkmarkOutline;
      case "rojo":
        return alertOutline;
      case "amarillo":
        return warningOutline;
      default:
        return informationOutline;
    }
  };

  useEffect(() => {
    if (openToast) {
      setColor(getColor());
      setIcon(getIcon());
    }
  }, [openToast]);

  return (
    <IonToast
      isOpen={openToast}
      onDidDismiss={onDidDismiss}
      message={message}
      duration={5000}
      position="top"
      className={`${color}`}
      icon={icon}
      buttons={[
        {
          icon: closeOutline,
          role: "cancel",
          handler: () => {
            onDidDismiss();
          },
        },
      ]}
    />
  );
}

export default CustomToast;
