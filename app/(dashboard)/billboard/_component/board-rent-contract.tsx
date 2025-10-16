import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Font,
} from "@react-pdf/renderer";

Font.register({
  family: "GeneralSans",
  src: "/GeneralSans-Bold.otf",
  fontWeight: "bold",
});

Font.register({
  family: "GeneralSans",
  src: "/GeneralSans-Semibold.otf",
  fontWeight: "semibold",
});

Font.register({
  family: "GeneralSans",
  src: "/GeneralSans-Regular.otf",
});

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontSize: 10, // base
    fontFamily: "GeneralSans",
    lineHeight: 1.5,
    width: 595.28,
    height: 841.89,
    display: "flex",
    flexDirection: "column",
  },
  container: {
    flexGrow: 1,
  },
  frame: {
    borderWidth: 8,
    borderColor: "black",
    borderStyle: "solid",
    paddingVertical: 18,
    paddingHorizontal: 8,
    textAlign: "center",
  },
  title: {
    fontSize: 15,
    fontWeight: 800,
    lineHeight: 1.6,
  },
  subtitle: {
    fontSize: 11.5,
    fontWeight: 600,
    marginTop: 16,
    marginBottom: 16,
  },
  fieldContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  fieldTitle: {
    fontSize: 10,
    fontWeight: 600,
  },
  text: {
    fontSize: 10,
  },
  column: {
    display: "flex",
    flexDirection: "column",
  },
  paragraphtitle: {
    fontSize: 11,
    fontWeight: 600,
    marginTop: 16,
  },
  paragraph: {
    fontSize: 9.5,
    marginBottom: 8,
  },
  footer: {
    position: "absolute",
    bottom: 25,
    left: 25,
    right: 25,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  footerLeft: {
    fontSize: 8.5,
    textAlign: "right",
  },
  footerRight: {
    fontSize: 8.5,
    textAlign: "right",
  },
});

type ContractPDFProps = {
  data: {
    companyName: string;
    type: string;
    capital: string;
    rccm: string;
    taxIdentificationNumber: string;
    address: string;
    AdvertiserName: string;
    AdvertiserPost: string;
    reference: string;
  };
};

export default function ContractPDF({ data }: ContractPDFProps) {
  return (
    <Document>
      <Page size={{ width: 595.28, height: 841.89 }} style={styles.page}>
        {/* Contenu principal */}
        <View style={styles.container}>
          <View style={styles.frame}>
            <Text style={styles.title}>
              CONTRAT DE LOCATION DE FACADE SUR BATIMENT OU TERRAIN PRIVÉE CONGO
            </Text>
          </View>
          <Text style={styles.subtitle}>D'une part,</Text>
          <View style={styles.column}>
            <View style={styles.fieldContainer}>
              <Text style={styles.fieldTitle}>Nom : </Text>
              <Text style={styles.text}>{data.companyName}</Text>
            </View>
            <View style={styles.fieldContainer}>
              <Text style={styles.fieldTitle}>Type : </Text>
              <Text style={styles.text}>{data.type}</Text>
            </View>
            <View style={styles.fieldContainer}>
              <Text style={styles.fieldTitle}>Capital : </Text>
              <Text style={styles.text}>{data.capital}</Text>
            </View>
            <View style={styles.fieldContainer}>
              <Text style={styles.fieldTitle}>
                Registre du Commerce et du Crédit Mobilier (RCCM) :{" "}
              </Text>
              <Text style={styles.text}>{data.rccm}</Text>
            </View>
            <View style={styles.fieldContainer}>
              <Text style={styles.fieldTitle}>Numéro ﬁscal : </Text>
              <Text style={styles.text}>{data.taxIdentificationNumber}</Text>
            </View>
            <View style={styles.fieldContainer}>
              <Text style={styles.fieldTitle}>Siège social : </Text>
              <Text style={styles.text}>{data.address}</Text>
            </View>
            <Text style={styles.text}>
              Représentée par {data.AdvertiserName}, agissant en qualité de{" "}
              {data.AdvertiserPost}, dûment habilité à cet effet, ci-après
              dénommée le « L’Annonceur ».
            </Text>
            <Text style={styles.subtitle}>D'autre part,</Text>
            <View style={styles.column}>
              <View style={styles.fieldContainer}>
                <Text style={styles.fieldTitle}>Nom : </Text>
                <Text style={styles.text}>ATLAS Congo,</Text>
              </View>
              <View style={styles.fieldContainer}>
                <Text style={styles.fieldTitle}>Type : </Text>
                <Text style={styles.text}>
                  Société à Responsabilité Limitée (SARL)
                </Text>
              </View>
              <View style={styles.fieldContainer}>
                <Text style={styles.fieldTitle}>Siège social : </Text>
                <Text style={styles.text}>
                  11, Avenue Moé VANGOULA Centre-Ville, BP: 746 Pointe-Noire,
                  République du Congo
                </Text>
              </View>
              <View style={styles.fieldContainer}>
                <Text style={styles.fieldTitle}>RCCM : </Text>
                <Text style={styles.text}>CG/PNR 14B356</Text>
              </View>
              <View style={styles.fieldContainer}>
                <Text style={styles.fieldTitle}>NIU : </Text>
                <Text style={styles.text}>M2014110001207071</Text>
              </View>
              <Text style={styles.text}>
                Représentée aux ﬁns des présentes par M. Ralph PINTO agissant en
                qualité de Co-Gérant. Ci-dessous dénommée « La Régie
                Publicitaire » D’autre part.
              </Text>
            </View>
            <Text style={styles.paragraphtitle}>
              Il a été convenu et arrêté ce qui suit :
            </Text>
            <Text style={styles.paragraph}>
              Les parties déclarent et garantissent posséder la capacité
              juridique nécessaire pour contracter et s'engager au titre du
              présent contrat. Elles reconnaissent que le contrat a été négocié
              de manière équitable et que chacune a eu la possibilité de
              consulter un conseiller juridique.
            </Text>
            <Text style={styles.paragraph}>
              Le présent contrat est régi par les lois en vigueur de la
              République Gabonaise et est sujet à modiﬁcation uniquement par
              accord écrit et signé par les deux parties.
            </Text>
            <Text style={styles.paragraph}>
              Ce contrat prend effet à la date de sa signature par les deux
              parties et demeurera en vigueur jusqu'à l'achèvement de toutes les
              obligations contractuelles, sauf résiliation anticipée conforme
              aux dispositions établies dans les articles suivants.
            </Text>
          </View>
        </View>

        {/* Footer fixe */}
        <View style={styles.footer}>
          <Text style={styles.footerLeft}>{data.reference}</Text>
          <Text style={styles.footerRight}>1 sur 9</Text>
        </View>
      </Page>
    </Document>
  );
}
