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
});

export default function BrochurePDF() {
  return (
    <Document>
      <Page size={{ width: 595.28, height: 841.89 }} style={styles.page}>
        {/* Contenu principal */}
        <View style={styles.container}>
          <View style={styles.frame}>
            <Text style={styles.title}>BROCHURE</Text>
          </View>
        </View>
      </Page>
    </Document>
  );
}
