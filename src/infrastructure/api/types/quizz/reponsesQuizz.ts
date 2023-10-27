export type BodyReponsesQuizz = {
    utilisateur: string
    reponses: Reponse[]
  } 
  
  export type Reponse = {
    [key: string]: string
  } 
