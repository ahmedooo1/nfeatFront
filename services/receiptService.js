// Service pour la génération de reçus PDF
let pdfMake = null;

// Ce service est construit pour être chargé uniquement côté client
const loadPdfMake = async () => {
  if (process.client && !pdfMake) {
    try {
      // Import dynamique côté client uniquement
      const pdfMakeModule = await import('pdfmake/build/pdfmake');
      const pdfFontsModule = await import('pdfmake/build/vfs_fonts');
      
      pdfMake = pdfMakeModule.default || pdfMakeModule;
      
      // Différentes façons dont les polices peuvent être exposées selon la version
      if (pdfFontsModule.default && pdfFontsModule.default.pdfMake) {
        pdfMake.vfs = pdfFontsModule.default.pdfMake.vfs;
      } else if (pdfFontsModule.pdfMake) {
        pdfMake.vfs = pdfFontsModule.pdfMake.vfs;
      } else {
        console.warn("Les polices PDF n'ont pas été chargées correctement");
      }
    } catch (error) {
      console.error("Erreur lors du chargement de pdfmake:", error);
      throw new Error("Impossible de charger le générateur de PDF: " + error.message);
    }
  }
  return pdfMake;
};

export default {
  /**
   * Génère un reçu PDF pour une commande
   */
  async generateReceipt(orderData, orderItems, userData, paymentId) {
    // S'assurer que pdfMake est chargé
    const pdfMake = await loadPdfMake();
    if (!pdfMake) {
      throw new Error('PDF generator not available in this environment');
    }
    
    const currentDate = new Date();
    const formattedDate = `${currentDate.getDate().toString().padStart(2, '0')}/${(currentDate.getMonth() + 1).toString().padStart(2, '0')}/${currentDate.getFullYear()}`;
    const formattedTime = `${currentDate.getHours().toString().padStart(2, '0')}:${currentDate.getMinutes().toString().padStart(2, '0')}`;
    
    // Calcul des totaux
    const totalHT = parseFloat(orderData.totalPrice);
    const tvaRate = 0.20; // 20% TVA
    const tvaAmount = parseFloat(orderData.tvaAmount);
    const totalTTC = parseFloat(orderData.totalPriceWithTva);
    
    // Création du tableau des articles
    const itemsTable = {
      table: {
        headerRows: 1,
        widths: ['*', 'auto', 'auto', 'auto'],
        body: [
          [
            { text: 'Article', style: 'tableHeader' },
            { text: 'Prix unitaire', style: 'tableHeader' },
            { text: 'Quantité', style: 'tableHeader' },
            { text: 'Total', style: 'tableHeader' }
          ],
          ...orderItems.map(item => {
            // S'assurer que les prix sont des nombres
            const price = parseFloat(item.price) || 0;
            const quantity = parseInt(item.quantity) || 1;
            return [
              item.name,
              `${price.toFixed(2)} €`,
              quantity.toString(),
              `${(price * quantity).toFixed(2)} €`
            ];
          })
        ]
      },
      layout: 'lightHorizontalLines'
    };
    
    // Définition du document PDF
    const docDefinition = {
      content: [
        // En-tête
        {
          columns: [
            {
              width: '*',
              stack: [
                { text: 'NF-EAT Restaurant', style: 'header' },
                { text: '123 Rue de la Gastronomie', style: 'subheader' },
                { text: '76500 Elbeuf', style: 'subheader' },
                { text: 'Tél: 07 XX XX XX XX', style: 'subheader' },
                { text: 'contact@nfeat.fr', style: 'subheader' }
              ]
            },
            {
              width: 'auto',
              stack: [
                { text: 'REÇU', style: 'receiptTitle' },
                { text: `Date: ${formattedDate}`, style: 'receiptInfo' },
                { text: `Heure: ${formattedTime}`, style: 'receiptInfo' },
                { text: `N° Commande: ${paymentId.slice(-8).toUpperCase()}`, style: 'receiptInfo' }
              ],
              alignment: 'right'
            }
          ]
        },
        
        // Informations client
        {
          stack: [
            { text: 'Informations client', style: 'sectionHeader', margin: [0, 20, 0, 10] },
            { text: `Nom: ${userData.name || userData.email}` },
            { text: `Email: ${userData.email}` },
            { text: `Téléphone: ${userData.phone || 'Non spécifié'}` },
            { text: `Adresse: ${userData.address || 'Non spécifiée'}` }
          ]
        },
        
        // Détails de la commande
        { text: 'Détails de la commande', style: 'sectionHeader', margin: [0, 20, 0, 10] },
        itemsTable,
        
        // Récapitulatif
        {
          stack: [
            { text: 'Récapitulatif', style: 'sectionHeader', margin: [0, 20, 0, 10] },
            {
              table: {
                widths: ['*', 'auto'],
                body: [
                  ['Total HT:', `${totalHT.toFixed(2)} €`],
                  [`TVA (${(tvaRate * 100)}%):`, `${tvaAmount.toFixed(2)} €`],
                  ['Total TTC:', `${totalTTC.toFixed(2)} €`]
                ]
              },
              layout: 'noBorders',
              alignment: 'right',
              margin: [0, 0, 0, 20]
            }
          ]
        },
        
        // Note de remerciement
        { text: 'Merci pour votre confiance et à bientôt chez NF-EAT!', style: 'thankYouNote', alignment: 'center', margin: [0, 30, 0, 0] }
      ],
      
      // Styles
      styles: {
        header: {
          fontSize: 18,
          bold: true,
          color: '#eab308'
        },
        subheader: {
          fontSize: 10,
          color: '#1f2937'
        },
        receiptTitle: {
          fontSize: 18,
          bold: true,
          color: '#1f2937'
        },
        receiptInfo: {
          fontSize: 10
        },
        sectionHeader: {
          fontSize: 14,
          bold: true,
          color: '#1f2937'
        },
        tableHeader: {
          bold: true,
          color: '#1f2937',
          fillColor: '#f3f4f6'
        },
        thankYouNote: {
          fontSize: 12,
          italics: true,
          color: '#6b7280'
        }
      },
      
      // Utiliser les polices par défaut de PDF (Roboto)
      defaultStyle: {
        font: 'Roboto'
      },
      // Définition des polices disponibles
      fonts: {
        // Les polices sont déjà définies dans vfs_fonts.js
        Roboto: {
          normal: 'Roboto-Regular.ttf',
          bold: 'Roboto-Medium.ttf',
          italics: 'Roboto-Italic.ttf',
          bolditalics: 'Roboto-MediumItalic.ttf'
        }
      }
    };
    
    return pdfMake.createPdf(docDefinition);
  },
  
  /**
   * Télécharge le reçu PDF avec un nom de fichier personnalisé
   */
  downloadReceipt(pdfDoc, filename = 'recu-commande.pdf') {
    if (pdfDoc) {
      pdfDoc.download(filename);
    }
  },
  
  /**
   * Ouvre le reçu PDF dans une nouvelle fenêtre
   */
  openReceipt(pdfDoc) {
    if (pdfDoc) {
      pdfDoc.open();
    }
  }
};