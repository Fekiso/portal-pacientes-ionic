import { IonSelect, IonSelectOption } from "@ionic/react";

const CustomDesplegable = ({ array, handleChange, mostrarTodos, label, id, value }) => {
  return (
    <>
      <IonSelect
        id={id}
        value={value}
        // placeholder={label}
        onIonChange={(ev) => handleChange(ev.detail.value, id)}
        label={`${label}`}
        label-placement="floating"
        interfaceOptions={{
          buttons: [
            {
              text: "Cancel",
              role: "cancel",
            },
          ],
        }}
      >
        {mostrarTodos ? (
          <IonSelectOption key={-1} value={-1}>
            Mostrar todos
          </IonSelectOption>
        ) : null}
        {array.map((item) => (
          <IonSelectOption key={item.codigo} value={item.codigo}>
            {item.text}
          </IonSelectOption>
        ))}
      </IonSelect>
    </>
  );
};

export default CustomDesplegable;
