import React, { useState } from "react";
import { IonItem, IonLabel, IonList, IonSearchbar, IonSelect, IonSelectOption } from "@ionic/react";

const options = [
  "Apple",
  "Banana",
  "Cherry",
  "Durian",
  "Elderberry",
  "Fig",
  "Grape",
  "Honeydew",
  "Imbe",
  "Jackfruit",
  "Kiwi",
  "Lime",
  "Mango",
  "Nectarine",
  "Orange",
  "Papaya",
  "Quince",
  "Raspberry",
  "Strawberry",
  "Tangerine",
  "Ugli fruit",
  "Vanilla bean",
  "Watermelon",
  "Xigua (Chinese watermelon)",
  "Yellow passionfruit",
  "Zucchini",
];

const CustomAutocompleteInput = () => {
  const [searchText, setSearchText] = useState("");
  const filteredOptions = options.filter((opcion) =>
    opcion.toLowerCase().includes(searchText.toLowerCase())
  );

  return (
    <>
      <IonSearchbar value={searchText} onIonChange={(e) => setSearchText(e.detail.value)} />
      <IonList>
        {filteredOptions.map((opcion) => (
          <IonItem key={opcion} button className="amarillo-sol">
            <IonLabel>{opcion}</IonLabel>
          </IonItem>
        ))}
      </IonList>
    </>
  );
};

export default CustomAutocompleteInput;
