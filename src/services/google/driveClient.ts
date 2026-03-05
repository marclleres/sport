import { storage } from '../storage';

interface DriveFile {
    id: string;
    name: string;
    mimeType: string;
}

async function getEntrainementFolderId(accessToken: string): Promise<string> {
    const folderQuery = "name='Entrainement' and mimeType='application/vnd.google-apps.folder' and trashed=false";
    const response = await fetch(
        `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(folderQuery)}&fields=files(id,name)`,
        { headers: { Authorization: `Bearer ${accessToken}` } }
    );

    if (!response.ok) {
        throw new Error(`Erreur Drive: ${response.status}`);
    }

    const data = await response.json();
    if (!data.files || data.files.length === 0) {
        throw new Error('Dossier Entrainement non trouvé');
    }

    return data.files[0].id;
}

async function createFolder(name: string, parentId: string, accessToken: string): Promise<string> {
    const response = await fetch(
        'https://www.googleapis.com/drive/v3/files',
        {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${accessToken}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                name,
                mimeType: 'application/vnd.google-apps.folder',
                parents: [parentId],
            }),
        }
    );

    if (!response.ok) {
        throw new Error(`Erreur création dossier: ${response.status}`);
    }

    const data = await response.json();
    return data.id;
}

async function uploadJsonFile(name: string, content: object, parentId: string, accessToken: string): Promise<void> {
    const boundary = 'boundary_sport_app';
    const jsonContent = JSON.stringify(content, null, 2);

    const body = [
        `--${boundary}`,
        'Content-Type: application/json; charset=UTF-8',
        '',
        JSON.stringify({ name, mimeType: 'application/json', parents: [parentId] }),
        `--${boundary}`,
        'Content-Type: application/json',
        '',
        jsonContent,
        `--${boundary}--`,
    ].join('\r\n');

    const response = await fetch(
        'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart',
        {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${accessToken}`,
                'Content-Type': `multipart/related; boundary=${boundary}`,
            },
            body,
        }
    );

    if (!response.ok) {
        throw new Error(`Erreur upload fichier: ${response.status}`);
    }
}

/**
 * Liste les dossiers dans le dossier "Entrainement"
 */
export async function listWeekFolders(): Promise<number[]> {
    const accessToken = storage.getAccessToken();

    if (!accessToken) {
        return [];
    }

    try {
        const entrainementFolderId = await getEntrainementFolderId(accessToken);

        const weekQuery = `'${entrainementFolderId}' in parents and mimeType='application/vnd.google-apps.folder' and trashed=false`;
        const weekResponse = await fetch(
            `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(weekQuery)}&fields=files(id,name)`,
            { headers: { Authorization: `Bearer ${accessToken}` } }
        );

        if (!weekResponse.ok) {
            if (weekResponse.status === 401 || weekResponse.status === 403) {
                storage.removeAccessToken();
            }
            return [];
        }

        const weekData = await weekResponse.json();

        const weeks: number[] = [];
        weekData.files.forEach((file: DriveFile) => {
            const match = file.name.match(/Week(\d+)/i);
            if (match) {
                weeks.push(parseInt(match[1]));
            }
        });

        return weeks.sort((a, b) => a - b);
    } catch (error) {
        return [];
    }
}

/**
 * Récupère le contenu d'un fichier JSON depuis un dossier WeekX
 */
export async function getJsonFileFromWeek(weekNumber: number, fileName: string): Promise<any> {
    const accessToken = storage.getAccessToken();

    if (!accessToken) {
        throw new Error('Non authentifié');
    }

    const entrainementFolderId = await getEntrainementFolderId(accessToken);

    const weekQuery = `name='Week${weekNumber}' and '${entrainementFolderId}' in parents and mimeType='application/vnd.google-apps.folder' and trashed=false`;
    const weekResponse = await fetch(
        `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(weekQuery)}&fields=files(id,name)`,
        { headers: { Authorization: `Bearer ${accessToken}` } }
    );

    if (!weekResponse.ok) {
        throw new Error(`Erreur Drive: ${weekResponse.status}`);
    }
    const weekData = await weekResponse.json();

    if (!weekData.files || weekData.files.length === 0) {
        throw new Error(`Dossier Week${weekNumber} non trouvé`);
    }

    const weekFolderId = weekData.files[0].id;

    const fileQuery = `name='${fileName}' and '${weekFolderId}' in parents and trashed=false`;
    const fileResponse = await fetch(
        `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(fileQuery)}&fields=files(id,name)`,
        { headers: { Authorization: `Bearer ${accessToken}` } }
    );

    if (!fileResponse.ok) {
        throw new Error(`Erreur Drive: ${fileResponse.status}`);
    }
    const fileData = await fileResponse.json();

    if (!fileData.files || fileData.files.length === 0) {
        throw new Error(`Fichier ${fileName} non trouvé dans Week${weekNumber}`);
    }

    const fileId = fileData.files[0].id;

    const contentResponse = await fetch(
        `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`,
        { headers: { Authorization: `Bearer ${accessToken}` } }
    );

    if (!contentResponse.ok) {
        throw new Error(`Erreur Drive: ${contentResponse.status}`);
    }

    return contentResponse.json();
}

/**
 * Met à jour le contenu d'un fichier JSON dans un dossier WeekX
 */
export async function saveJsonFileToWeek(weekNumber: number, fileName: string, content: object): Promise<void> {
    const accessToken = storage.getAccessToken();
    if (!accessToken) {
        throw new Error('Non authentifié');
    }

    const entrainementFolderId = await getEntrainementFolderId(accessToken);

    const weekQuery = `name='Week${weekNumber}' and '${entrainementFolderId}' in parents and mimeType='application/vnd.google-apps.folder' and trashed=false`;
    const weekResponse = await fetch(
        `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(weekQuery)}&fields=files(id,name)`,
        { headers: { Authorization: `Bearer ${accessToken}` } }
    );
    if (!weekResponse.ok) throw new Error(`Erreur Drive: ${weekResponse.status}`);
    const weekData = await weekResponse.json();
    if (!weekData.files || weekData.files.length === 0) throw new Error(`Dossier Week${weekNumber} non trouvé`);
    const weekFolderId = weekData.files[0].id;

    const fileQuery = `name='${fileName}' and '${weekFolderId}' in parents and trashed=false`;
    const fileResponse = await fetch(
        `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(fileQuery)}&fields=files(id,name)`,
        { headers: { Authorization: `Bearer ${accessToken}` } }
    );
    if (!fileResponse.ok) throw new Error(`Erreur Drive: ${fileResponse.status}`);
    const fileData = await fileResponse.json();

    if (fileData.files && fileData.files.length > 0) {
        const fileId = fileData.files[0].id;
        const updateResponse = await fetch(
            `https://www.googleapis.com/upload/drive/v3/files/${fileId}?uploadType=media`,
            {
                method: 'PATCH',
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(content, null, 2),
            }
        );
        if (!updateResponse.ok) throw new Error(`Erreur mise à jour fichier: ${updateResponse.status}`);
    } else {
        await uploadJsonFile(fileName, content, weekFolderId, accessToken);
    }
}

/**
 * Crée un nouveau dossier WeekN+1 en copiant la structure du dernier week (sets vides)
 */
export async function createNextWeek(): Promise<number> {
    const accessToken = storage.getAccessToken();
    if (!accessToken) {
        throw new Error('Non authentifié');
    }

    const weeks = await listWeekFolders();
    const maxWeek = weeks.length > 0 ? Math.max(...weeks) : 0;
    const newWeekNumber = maxWeek + 1;

    const jsonFiles = ['HautDuCorps.json', 'Jambes.json', 'FullBody.json'];

    const filesContent: { name: string; content: object }[] = [];
    for (const fileName of jsonFiles) {
        if (maxWeek > 0) {
            try {
                const data = await getJsonFileFromWeek(maxWeek, fileName);
                const emptied = {
                    ...data,
                    exercises: data.exercises?.map((ex: any) => ({ ...ex, set: [] })) ?? [],
                };
                filesContent.push({ name: fileName, content: emptied });
            } catch {
                filesContent.push({ name: fileName, content: { seance: fileName.replace('.json', ''), exercises: [] } });
            }
        } else {
            filesContent.push({ name: fileName, content: { seance: fileName.replace('.json', ''), exercises: [] } });
        }
    }

    const entrainementFolderId = await getEntrainementFolderId(accessToken);
    const newWeekFolderId = await createFolder(`Week${newWeekNumber}`, entrainementFolderId, accessToken);

    for (const { name, content } of filesContent) {
        await uploadJsonFile(name, content, newWeekFolderId, accessToken);
    }

    return newWeekNumber;
}
