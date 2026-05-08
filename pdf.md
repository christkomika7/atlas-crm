

const Quixote = () => (
 <Document>
        <Page size="A4" style={styles.page}>

            {/* Row 1 — Logo */}
            <View style={styles.header}>
                <Text style={styles.headerText}>Mon Logo</Text>
            </View>

            {/* Row 2 — 3 cellules */}
            <View style={styles.row}>
                <View style={styles.cell}>
                    <Text style={styles.cellText}>Cellule 1</Text>
                </View>
                <View style={styles.cell}>
                    <Text style={styles.cellText}>Cellule 2</Text>
                </View>
                <View style={styles.cell}>
                    <Text style={styles.cellText}>Cellule 3</Text>
                </View>
            </View>

        </Page>
    </Document>
);

Font.register({
  family: 'Oswald',
  src: 'https://fonts.gstatic.com/s/oswald/v13/Y_TKV6o8WovbUd3m_X9aAA.ttf'
});


const styles = StyleSheet.create({
    page: {
        paddingTop: 0,
        paddingBottom: 0,
        paddingHorizontal: 0,
    },

    // ── Row 1 ──
    header: {
        height: 150,
        borderBottomWidth: 10,
        borderBottomColor: '#6EE7B7',
        borderBottomStyle: 'solid',
        alignItems: 'center',
        justifyContent: 'center',
    },
    headerText: {
        fontSize: 28,
        fontFamily: 'Oswald',
        color: '#059669',
        letterSpacing: 3,
        textTransform: 'uppercase',
    },

    // ── Row 2 ──
    row: {
        flexDirection: 'row',
        height: 230,
    },
    cell: {
        flex: 1,
        backgroundColor: '#ECFDF5',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16,
    },
    cellText: {
        fontSize: 11,
        fontFamily: 'Times-Roman',
        color: '#065F46',
        textAlign: 'center',
        lineHeight: 1.6,
    },
})


ReactPDF.render(<Quixote />);
