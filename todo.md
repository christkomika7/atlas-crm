# Delete
`
- Lorsque je cree un user en ligne le bouton a du retard corriger cela
- Delete shadcn tab 
- Supprimer tout les users qui ne sont pas admin et qui n'ont pas d entreprise apres chaque requete
- Si il est ban il n a plus acces au site
- Corriger le probleme du declanchement automatique des boutons avec des commandes  {
    ex: http://localhost:3000/settings/company/create
}
`



export const clientSchema = z.object({
    companyName: z.string().min(1, {
        message: "Le nom de la companie est obligatoire."
    }),
    lastname: z.string().min(1, {
        message: "Le nom de famille est obligatoire."
    }),
    firstname: z.string().min(1, {
        message: "Le prénom est obligatoire."
    }),
    email: z.string().trim().min(1, {
        message: "L'adresse mail est obligatoire."
    }).email({
        message: "Cette adresse mail est invalide."
    }),
    phone: z.string().min(1, {
        message: "Le numéro de téléphone est obligatoire."
    }),
    website: z.string().url({
        message: "L'URL du site web est invalide."
    }).optional(),
    address: z.string().min(1, {
        message: "L'adresse enregistrée est obligatoire."
    }),
    businessSector: z.string({
        message: "Veuillez selectionner un secteur d'activité."
    }).min(1, {
        message: "Le secteur d'activité est obligatoire.",
    }),
    businessRegistrationNumber: z.string().min(1, {
        message: "Le numéro d'immatriculation (RCCM) est obligatoire."
    }),
    taxIdentificationNumber: z.string().min(1, {
        message: "Le numéro d'identification fiscale (NIF) est obligatoire."
    }),
    discount: z.string({
        message: "Veuillez selectionner la réduction."
    })
        .min(1, "La réduction est obligatoire"),
    paymentTerms: z.string({
        message: "Veuillez selectionner la condition de paiement."
    }).min(1, {
        message: "La condition de paiement est obligatoire.",
    }),
    information: z.string(),
    // Supprimez cette ligne si vous utilisez FormData
    // uploadDocuments: z.array(z.instanceof(File)).optional(),
});

// Schéma séparé pour valider les fichiers côté serveur
export const fileSchema = z.object({
    name: z.string(),
    size: z.number(),
    type: z.string(),
    lastModified: z.number().optional(),
});

// Schéma pour valider les données avec fichiers côté serveur
export const clientSchemaWithFiles = clientSchema.extend({
    uploadDocuments: z.array(fileSchema).optional(),
});


// Dans votre route API
import { NextRequest, NextResponse } from 'next/server';
import { clientSchema } from './schema'; // Schéma sans uploadDocuments

export async function POST(request: NextRequest) {
    try {
        const formData = await request.formData();
        
        // Extraire les données du formulaire
        const rawData = {
            companyName: formData.get('companyName') as string,
            lastname: formData.get('lastname') as string,
            firstname: formData.get('firstname') as string,
            email: formData.get('email') as string,
            phone: formData.get('phone') as string,
            website: formData.get('website') as string,
            address: formData.get('address') as string,
            businessSector: formData.get('businessSector') as string,
            businessRegistrationNumber: formData.get('businessRegistrationNumber') as string,
            taxIdentificationNumber: formData.get('taxIdentificationNumber') as string,
            discount: formData.get('discount') as string,
            paymentTerms: formData.get('paymentTerms') as string,
            information: formData.get('information') as string,
        };

        // Valider les données du formulaire
        const validatedData = clientSchema.parse(rawData);

        // Extraire les fichiers séparément
        const files = formData.getAll('files') as File[];
        
        // Valider les fichiers
        const validatedFiles = files.map(file => {
            if (!(file instanceof File)) {
                throw new Error('Invalid file format');
            }
            return file;
        });

        // Traiter les données et fichiers validés
        console.log('Données validées:', validatedData);
        console.log('Fichiers validés:', validatedFiles);

        return NextResponse.json({ 
            success: true, 
            data: validatedData,
            filesCount: validatedFiles.length 
        });

    } catch (error) {
        console.error('Erreur de validation:', error);
        return NextResponse.json({ 
            success: false, 
            error: error instanceof Error ? error.message : 'Erreur inconnue' 
        }, { status: 400 });
    }
}

export const clientSchema = z.object({
    companyName: z.string().min(1, {
        message: "Le nom de la companie est obligatoire."
    }),
    lastname: z.string().min(1, {
        message: "Le nom de famille est obligatoire."
    }),
    firstname: z.string().min(1, {
        message: "Le prénom est obligatoire."
    }),
    email: z.string().trim().min(1, {
        message: "L'adresse mail est obligatoire."
    }).email({
        message: "Cette adresse mail est invalide."
    }),
    phone: z.string().min(1, {
        message: "Le numéro de téléphone est obligatoire."
    }),
    website: z.string().url({
        message: "L'URL du site web est invalide."
    }).optional(),
    address: z.string().min(1, {
        message: "L'adresse enregistrée est obligatoire."
    }),
    businessSector: z.string({
        message: "Veuillez selectionner un secteur d'activité."
    }).min(1, {
        message: "Le secteur d'activité est obligatoire.",
    }),
    businessRegistrationNumber: z.string().min(1, {
        message: "Le numéro d'immatriculation (RCCM) est obligatoire."
    }),
    taxIdentificationNumber: z.string().min(1, {
        message: "Le numéro d'identification fiscale (NIF) est obligatoire."
    }),
    discount: z.string({
        message: "Veuillez selectionner la réduction."
    })
        .min(1, "La réduction est obligatoire"),
    paymentTerms: z.string({
        message: "Veuillez selectionner la condition de paiement."
    }).min(1, {
        message: "La condition de paiement est obligatoire.",
    }),
    information: z.string(),
    uploadDocuments: z.array(z.any()).optional().refine((files) => {
        if (!files) return true;
        
        return files.every(file => {
            return file && 
                   typeof file === 'object' && 
                   'name' in file && 
                   'size' in file && 
                   'type' in file;
        });
    }, {
        message: "Format de fichier invalide."
    }),
});


// Côté client - envoi des données
const handleSubmit = async (data: any) => {
    const formData = new FormData();
    
    // Ajouter les données du formulaire
    Object.keys(data).forEach(key => {
        if (key !== 'uploadDocuments') {
            formData.append(key, data[key]);
        }
    });
    
    // Ajouter les fichiers
    if (data.uploadDocuments && data.uploadDocuments.length > 0) {
        data.uploadDocuments.forEach((file: File) => {
            formData.append('files', file);
        });
    }
    
    try {
        const response = await fetch('/api/client/123', {
            method: 'POST',
            body: formData, // Pas de Content-Type header, le navigateur le gère
        });
        
        const result = await response.json();
        console.log('Résultat:', result);
    } catch (error) {
        console.error('Erreur:', error);
    }
};