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
   * Récupère les informations de l'utilisateur courant
   * @param {Object} $axios - Instance Axios de Nuxt
   * @returns {Promise<Object>} - Les données de l'utilisateur
   */
  async getCurrentUser($axios) {
    try {
      if (!$axios) {
        console.warn('No axios instance provided to getCurrentUser');
        return null;
      }
      
      const response = await $axios.post('/user/getcurrent');
      console.log('User data fetched for receipt:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error fetching current user for receipt:', error);
      return null;
    }
  },

  /**
   * Génère un reçu PDF pour une commande
   */
  async generateReceipt(orderData, orderItems, userData, paymentId, $axios) {
    // Tenter de récupérer les informations utilisateur complètes si userData est incomplet
    let enhancedUserData = { ...userData };
    
    if ($axios && (!userData?.name || userData?.name === 'undefined undefined' || !userData?.email)) {
      try {
        const currentUser = await this.getCurrentUser($axios);
        if (currentUser) {
          // Construire un nom valide à partir des données de l'API
          let name = '';
          if (currentUser.name) {
            name = currentUser.name;
          } else if (currentUser.firstname || currentUser.lastname) {
            name = `${currentUser.firstname || ''} ${currentUser.lastname || ''}`.trim();
          }
          
          enhancedUserData = { 
            ...enhancedUserData, 
            ...currentUser,
            name: name || 'Client'  // Assurer qu'il y a toujours une valeur par défaut
          };
          
          console.log('Enhanced user data for receipt:', enhancedUserData);
        }
      } catch (error) {
        console.warn('Could not enhance user data for receipt:', error);
      }
    }
    
    // S'assurer que les données utilisateur contiennent des valeurs par défaut si nécessaire
    enhancedUserData.name = enhancedUserData.name || 'Client';
    enhancedUserData.email = enhancedUserData.email || '';
    
    // S'assurer que pdfMake est chargé
    const pdfMake = await loadPdfMake();
    if (!pdfMake) {
      throw new Error('PDF generator not available in this environment');
    }
    
    // Formatage de la date et heure
    const currentDate = new Date();
    const formattedDate = `${currentDate.getDate().toString().padStart(2, '0')}/${(currentDate.getMonth() + 1).toString().padStart(2, '0')}/${currentDate.getFullYear()}`;
    const formattedTime = `${currentDate.getHours().toString().padStart(2, '0')}:${currentDate.getMinutes().toString().padStart(2, '0')}`;
    
    // Génération d'un numéro de reçu officiel basé sur la date et l'ID
    const receiptNumber = `NF-${currentDate.getFullYear()}${(currentDate.getMonth() + 1).toString().padStart(2, '0')}${currentDate.getDate().toString().padStart(2, '0')}-${paymentId.slice(-4).toUpperCase()}`;
    
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
      layout: {
        hLineWidth: function(i, node) {
          return (i === 0 || i === node.table.body.length) ? 1 : 0.5;
        },
        vLineWidth: function(i, node) {
          return 0;
        },
        hLineColor: function(i, node) {
          return (i === 0 || i === node.table.body.length) ? '#aaaaaa' : '#dddddd';
        },
        paddingLeft: function(i, node) { return 8; },
        paddingRight: function(i, node) { return 8; },
        paddingTop: function(i, node) { return 5; },
        paddingBottom: function(i, node) { return 5; }
      }
    };
    
    // Définition du document PDF
    const docDefinition = {
      pageSize: 'A4',
      pageMargins: [40, 40, 40, 60],
      content: [
        // En-tête avec logo
        {
          columns: [
            {
              width: '*',
              stack: [
                { text: 'NF-EAT', style: 'header' },
                { text: '123 Rue de la Gastronomie', style: 'subheader' },
                { text: '76500 Elbeuf, France', style: 'subheader' },
                { text: 'Tél: +33 7 XX XX XX XX', style: 'subheader' },
                { text: 'SIRET: 000 000 000 00000', style: 'subheader' },
                { text: 'TVA Intra: FR00000000000', style: 'subheader' },
                { text: 'contact@nfeat.fr | www.nfeat.fr', style: 'subheader' }
              ]
            },
            {
              width: 'auto',
              stack: [
                { text: 'FACTURE', style: 'receiptTitle' },
                { text: `N°: ${receiptNumber}`, style: 'receiptInfo', margin: [0, 5, 0, 0] },
                { text: `Date: ${formattedDate}`, style: 'receiptInfo', margin: [0, 3, 0, 0] },
                { text: `Heure: ${formattedTime}`, style: 'receiptInfo', margin: [0, 3, 0, 0] },
                { text: `Réf. commande: ${paymentId.slice(-8).toUpperCase()}`, style: 'receiptInfo', margin: [0, 3, 0, 0] }
              ],
              alignment: 'right'
            }
          ]
        },
        
        // Ligne de séparation
        { canvas: [ { type: 'line', x1: 0, y1: 5, x2: 515, y2: 5, lineWidth: 1, lineColor: '#aaaaaa' } ], margin: [0, 20, 0, 20] },
        
        // Informations client
        {
          columns: [
            {
              width: '*',
              text: 'FACTURÉ À:',
              style: 'sectionHeader',
              margin: [0, 0, 0, 5]
            },
            {
              width: 'auto',
              text: 'DÉTAILS DE PAIEMENT:',
              style: 'sectionHeader',
              margin: [0, 0, 0, 5]
            }
          ]
        },
        {
          columns: [
            {
              width: '*',
              stack: [
                // Utilisation du nom du client amélioré
                { text: enhancedUserData.name, style: 'clientInfoHeader' },
                { text: enhancedUserData.address ? enhancedUserData.address : 'Adresse non spécifiée', style: 'clientInfo' },
                { text: enhancedUserData.phone ? `Tél: ${enhancedUserData.phone}` : '', style: 'clientInfo' },
                { text: enhancedUserData.email || '', style: 'clientInfo' }
              ]
            },
            {
              width: 'auto',
              stack: [
                { text: 'Mode de paiement:', style: 'paymentInfoHeader' },
                { text: 'Carte bancaire', style: 'paymentInfo' },
                { text: `Transaction ID: ${paymentId.slice(-12).toUpperCase()}`, style: 'paymentInfo' },
                { text: 'Statut: Payé', style: 'paymentInfo' }
              ]
            }
          ],
          margin: [0, 0, 0, 20]
        },
        
        // Détails de la commande
        { text: 'DÉTAILS DE LA COMMANDE', style: 'sectionHeader', margin: [0, 10, 0, 10] },
        itemsTable,
        
        // Récapitulatif des totaux
        {
          table: {
            widths: ['*', 'auto'],
            body: [
              [
                { text: 'Sous-total HT:', style: 'totalsLabel', alignment: 'right' },
                { text: `${totalHT.toFixed(2)} €`, style: 'totalsAmount' }
              ],
              [
                { text: `TVA (${(tvaRate * 100)}%):`, style: 'totalsLabel', alignment: 'right' },
                { text: `${tvaAmount.toFixed(2)} €`, style: 'totalsAmount' }
              ],
              [
                { text: 'Total TTC:', style: 'totalsTTCLabel', alignment: 'right' },
                { text: `${totalTTC.toFixed(2)} €`, style: 'totalsTTCAmount' }
              ]
            ]
          },
          layout: 'noBorders',
          margin: [0, 20, 0, 20]
        },
        
        // Conditions et notes
        { text: 'Conditions & Informations', style: 'sectionHeader', margin: [0, 10, 0, 5] },
        { text: 'La facture est établie en euros. Conformément aux dispositions de l\'article 293B du CGI, la TVA n\'est pas applicable.', style: 'conditions' },
        { text: 'Merci de votre confiance. Nous espérons vous revoir bientôt chez NF-EAT Restaurant.', style: 'conditions', margin: [0, 5, 0, 0] },
      ],
      
      footer: function(currentPage, pageCount) {
        return {
          columns: [
            { text: `NF-EAT Restaurant - SIRET: 000 000 000 00000 - TVA Intra: FR00000000000`, alignment: 'center', style: 'footer' },
            { text: `Page ${currentPage} sur ${pageCount}`, alignment: 'right', style: 'footer' }
          ],
          margin: [40, 10, 40, 0]
        };
      },
      
      // Styles
      styles: {
        header: {
          fontSize: 18,
          bold: true,
          color: '#eab308',
          margin: [0, 0, 0, 3]
        },
        subheader: {
          fontSize: 10,
          color: '#1f2937',
          margin: [0, 0, 0, 2]
        },
        receiptTitle: {
          fontSize: 18,
          bold: true,
          color: '#1f2937'
        },
        receiptInfo: {
          fontSize: 11,
          color: '#4b5563'
        },
        sectionHeader: {
          fontSize: 12,
          bold: true,
          color: '#1f2937',
          decoration: 'underline'
        },
        clientInfoHeader: {
          fontSize: 11,
          bold: true,
          margin: [0, 5, 0, 3]
        },
        clientInfo: {
          fontSize: 10,
          margin: [0, 0, 0, 2]
        },
        paymentInfoHeader: {
          fontSize: 11,
          bold: true,
          margin: [0, 5, 0, 3]
        },
        paymentInfo: {
          fontSize: 10,
          margin: [0, 0, 0, 2]
        },
        tableHeader: {
          bold: true,
          fontSize: 11,
          color: '#ffffff',
          fillColor: '#1f2937'
        },
        totalsLabel: {
          bold: true,
          fontSize: 10,
          color: '#4b5563'
        },
        totalsAmount: {
          bold: true,
          fontSize: 10
        },
        totalsTTCLabel: {
          bold: true,
          fontSize: 12,
          color: '#1f2937'
        },
        totalsTTCAmount: {
          bold: true,
          fontSize: 12,
          color: '#1f2937'
        },
        conditions: {
          fontSize: 9,
          italics: true,
          color: '#6b7280'
        },
        footer: {
          fontSize: 8,
          color: '#9ca3af'
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
   async fetchUserProfile() {
      try {
        const response = await this.$axios.post('/user/getcurrent')
        console.log('User profile:', response.data)
        if (response.data.picture) {
          response.data.picture = `data:image/jpeg;base64,${response.data.picture}`;
        }
        this.user = response.data
      } catch (error) {
        console.error('Error fetching user profile:', error)
      }
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