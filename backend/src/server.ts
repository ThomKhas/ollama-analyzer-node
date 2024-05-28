import express from 'express';
import multer from 'multer';
import cors from 'cors';
import { Ollama } from '@langchain/community/llms/ollama';
import { PromptTemplate } from '@langchain/core/prompts';

const app = express();
const upload = multer({ dest: 'uploads/' });
app.use(express.json());
app.use(cors());


app.post('/upload', upload.single('pdf'), (req, res) => {
  if (!req.file) {
    return res.status(400).send('No se ha seleccionado ningún archivo');
  }
  res.send('Archivo PDF cargado exitosamente');
});

app.listen(5000, () => {
  console.log('Servidor backend en ejecución en el puerto 5000');
});

app.post('/analyze', async (req, res) => {
  console.log('Se ha recibido una solicitud de análisis');
  const { text } = req.body;

  try {
    const ollama = new Ollama({
      baseUrl: 'http://localhost:11434',
      model: 'llama3',
    });

    const template = `EN BASE AL TEXTO QUE TE DARE, DEBES RESPONDER UNICAMENTE LOS PUNTOS QUE TE MENCIONO, NO EXPLIQUES NADA MAS QUE NO SEA LOS PUNTOS QUE TE DARE A CONTINUACION:
    1) QUE NIVEL DE MADUREZ TECNOLOGICA TIENE EL PROYECTO?, ESTA PREGUNTA SE RESPONDE CON UN NUMERO DEL 1 AL 9, DONDE 1 ES EL MAS BAJO Y 9 EL MAS ALTO, LA RESPUESTA SERIA ALGO ASI, "EL NIVEL DE MADUREZ TECNOLOGICA DEL PROYECTO ES DE 5", 
    JUNTO CON UNA BREVE DESCRIPCION DE PORQUE TIENE ESE NIVEL. Debes tener en cuanto si el proyecto es solo una idea, si ya tiene un prototipo, si ya esta en el mercado, si ya tiene usuarios, etc. Si solo es la conceptualizacion de la idea, deberias tenerlo en cuenta para darle un nivel bajo, si ya tiene un prototipo funcional, deberias darle un nivel mas alto, si ya esta en el mercado y tiene usuarios, deberias darle un nivel aun mas alto.
    Esto es importatne para saber en que nivel de desarrollo se encuentra el proyecto y que tan avanzado esta a un nivel muy exacto y preciso. Si no presenta pruebas como test, prototipos, etc, no puede tener un nivel alto, si ya esta en el mercado y tiene usuarios, deberia tener un nivel alto.
   
    2) EXPLICA EL NIVEL DE TRL QUE LE DISTE AL PROYECTO en el punto 1, si por ejemplo en el punto uno dices que tiene un nivel 3, explica en que consiste el nivel 3 de los TRL. 
    
    3) Da recomendaciones para mejorar el proyecto o el informe, con un maximo de 5 recomendaciones. Si aparenta tener una buena estructura y buenos fundamentos, di que de momento va bien. Si ves que le falta algo, mencionalo y da recomendaciones para mejorarlo.:
     
     {text}
     
     Evaluación TRL:`;

    const prompt = new PromptTemplate({
      template: template,
      inputVariables: ['text'],
    });
    
    const input = await prompt.format({ text });
    const response = await ollama.call(input);

    res.json({ result: response });
    console.log('Se ha completado el análisis exitosamente.');
  } catch (error) {
    console.error('Error durante el análisis:', error);
    res.status(500).json({ error: 'Error durante el análisis' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor escuchando en el puerto ${PORT}`);
});