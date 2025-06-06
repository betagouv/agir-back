import { Echelle } from '../../../../src/domain/aides/echelle';
import { Article } from '../../../../src/domain/contenu/article';
import { Categorie } from '../../../../src/domain/contenu/categorie';
import { History } from '../../../../src/domain/history/history';
import { Thematique } from '../../../../src/domain/thematique/thematique';
import { TestUtil } from '../../../../test/TestUtil';

const BASIC_ARTICLE: Article = new Article({
  ...TestUtil.articleData(),
  thematique_principale: Thematique.alimentation,
  thematiques: [Thematique.alimentation, Thematique.climat],
  tags_utilisateur: [],
  categorie: Categorie.recommandation,
  source: 'source',
  sources: [{ label: 'source 1', url: 'https//sources1' }],
  echelle: Echelle.National,
  tags_a_exclure: [],
  tags_a_inclure: [],
});

describe('History', () => {
  it('WHEN un vie historique ok', () => {
    // WHEN
    const history = new History();

    // THEN
    expect(history.nombreArticles()).toEqual(0);
  });
  it('cree un historique ok', () => {
    // GIVEN
    const history = new History({
      version: 0,
      quizz_interactions: [
        {
          content_id: '1',
          like_level: 2,
          attempts: [{ date: new Date(), score: 34 }],
        },
      ],
      article_interactions: [
        {
          content_id: '1',
          like_level: 2,
          read_date: new Date(123),
          favoris: true,
          liste_partages: [],
        },
      ],
      aide_interactions: [
        {
          clicked_demande: true,
          clicked_infos: false,
          content_id: '1',
          vue_at: new Date(),
          est_connue_utilisateur: true,
          sera_sollicitee_utilisateur: false,
          feedback: 'good',
          like_level: 3,
        },
      ],
    });

    // WHEN
    const article = history.getArticleHistoryById('1');

    // THEN
    expect(article.content_id).toEqual('1');
    expect(article.like_level).toEqual(2);
    expect(article.read_date.getTime()).toEqual(123);
  });
  it('cree un historique ok avec favoris et point en poche undefined', () => {
    // WHEN
    const history = new History({
      version: 0,
      quizz_interactions: [
        {
          content_id: '1',
          like_level: 2,
          attempts: [{ date: new Date(), score: 34 }],
        },
      ],
      article_interactions: [
        {
          content_id: '1',
          like_level: 2,
          read_date: new Date(123),
          favoris: undefined,
          liste_partages: [],
        },
      ],
      aide_interactions: [
        {
          clicked_demande: true,
          clicked_infos: false,
          content_id: '1',
          vue_at: new Date(),
          est_connue_utilisateur: true,
          sera_sollicitee_utilisateur: false,
          feedback: 'good',
          like_level: 3,
        },
      ],
    });

    // THEN
    expect(history.getArticleHistoryById('1').favoris).toStrictEqual(false);
  });
  it('lire un nouveau article insert un nouveau aricle', () => {
    // GIVEN
    const history = new History();

    // WHEN
    history.lireArticle('1');

    // THEN
    expect(history.nombreArticles()).toEqual(1);
  });
  it('faire un nouveau quizz insert un nouveau quizz', () => {
    // GIVEN
    const history = new History();

    // WHEN
    history.quizzAttempt('1', 12);

    // THEN
    expect(history.nombreQuizz()).toEqual(1);
    expect(history.getQuizzHistoryById('1').attempts).toHaveLength(1);
    expect(history.getQuizzHistoryById('1').attempts[0].score).toEqual(12);
    expect(
      history.getQuizzHistoryById('1').attempts[0].date.getTime(),
    ).toBeGreaterThan(Date.now() - 100);
  });
  it('on peut lire 2 fois le meme article', () => {
    // GIVEN
    const history = new History();

    // WHEN
    history.lireArticle('1');
    history.lireArticle('1');

    // THEN
    expect(history.nombreArticles()).toEqual(1);
  });
  it('on peut tenter 2 fois le meme quizz', () => {
    // GIVEN
    const history = new History();

    // WHEN
    history.quizzAttempt('1', 10);
    history.quizzAttempt('1', 20);

    // THEN
    expect(history.nombreQuizz()).toEqual(1);
    expect(history.getQuizzHistoryById('1').attempts).toHaveLength(2);
  });
  it('lire un aricle valorise la date de lecture', () => {
    // GIVEN
    const history = new History();

    // WHEN
    history.lireArticle('1');

    // THEN
    const article = history.getArticleHistoryById('1');
    expect(article.read_date.getTime()).toBeGreaterThan(Date.now() - 100);
  });
  it('liste articles lus', () => {
    // GIVEN
    const history = new History({
      version: 0,
      quizz_interactions: [],
      article_interactions: [
        {
          content_id: '1',
          read_date: new Date(),
          favoris: false,
          liste_partages: [],
        },
        {
          content_id: '2',
          read_date: null,
          favoris: false,
          liste_partages: [],
        },
        {
          content_id: '3',
          read_date: new Date(),
          favoris: false,
          liste_partages: [],
        },
        { content_id: '4', favoris: false, liste_partages: [] },
      ],
      aide_interactions: [],
    });

    // WHEN
    const result = history.searchArticlesIds({ est_lu: true });

    // THEN
    expect(result).toHaveLength(2);
    expect(result).toContain('1');
    expect(result).toContain('3');
  });
  it('liste articles favoris', () => {
    // GIVEN
    const history = new History({
      version: 0,
      quizz_interactions: [],
      aide_interactions: [],
      article_interactions: [
        { content_id: '1', favoris: true, liste_partages: [] },
        { content_id: '2', favoris: null, liste_partages: [] },
        { content_id: '3', favoris: false, liste_partages: [] },
        { content_id: '4', favoris: false, liste_partages: [] },
      ],
    });

    // WHEN
    const result = history.searchArticlesIds({ est_favoris: true });

    // THEN
    expect(result).toHaveLength(1);
    expect(result).toContain('1');
  });
  it('liste quizz avec 100%', () => {
    // GIVEN
    const history = new History({
      version: 0,
      article_interactions: [],
      aide_interactions: [],
      quizz_interactions: [
        {
          content_id: '1',
          attempts: [{ date: new Date(), score: 40 }],
        },
        {
          content_id: '2',
          attempts: [{ date: new Date(), score: 100 }],
        },
        {
          content_id: '3',
          attempts: [
            { date: new Date(), score: 10 },
            { date: new Date(), score: 100 },
          ],
        },
      ],
    });

    // WHEN
    const result = history.listeIdsQuizz100Pour100();

    // THEN
    expect(result).toHaveLength(2);
    expect(result).toContain('2');
    expect(result).toContain('3');
  });
  it('liste quizz avec des attempts', () => {
    // GIVEN
    const history = new History({
      version: 0,
      article_interactions: [],
      aide_interactions: [],
      quizz_interactions: [
        {
          content_id: '1',
          attempts: [{ date: new Date(), score: 40 }],
        },
        {
          content_id: '2',
          attempts: [{ date: new Date(), score: 100 }],
        },
        { content_id: '3', attempts: [] },
      ],
    });

    // WHEN
    const result = history.listeIdsQuizzAttempted();

    // THEN
    expect(result).toHaveLength(2);
    expect(result).toContain('1');
    expect(result).toContain('2');
  });
  it('liste articles lus par date desc', () => {
    // GIVEN
    const history = new History({
      version: 0,
      quizz_interactions: [],
      aide_interactions: [],
      article_interactions: [
        {
          content_id: '1',
          read_date: new Date(1),
          favoris: false,
          liste_partages: [],
        },
        {
          content_id: '2',
          read_date: null,
          favoris: false,
          liste_partages: [],
        },
        {
          content_id: '3',
          read_date: new Date(2),
          favoris: false,
          liste_partages: [],
        },
        { content_id: '4', favoris: false, liste_partages: [] },
        {
          content_id: '5',
          read_date: new Date(0),
          favoris: false,
          liste_partages: [],
        },
      ],
    });

    const liste_articles: Article[] = [];
    liste_articles.push(new Article({ ...BASIC_ARTICLE, content_id: '1' }));
    liste_articles.push(new Article({ ...BASIC_ARTICLE, content_id: '3' }));
    liste_articles.push(new Article({ ...BASIC_ARTICLE, content_id: '5' }));

    // WHEN
    const result = history.orderArticlesByReadDateAndFavoris(liste_articles);

    // THEN
    expect(result).toHaveLength(3);
    expect(result[0].content_id).toEqual('3');
    expect(result[1].content_id).toEqual('1');
    expect(result[2].content_id).toEqual('5');
  });
  it('liste articles lus par date desc, favoris en premier', () => {
    // GIVEN
    const history = new History({
      version: 0,
      quizz_interactions: [],
      aide_interactions: [],
      article_interactions: [
        {
          content_id: '1',
          read_date: new Date(1),
          favoris: true,
          liste_partages: [],
        },
        {
          content_id: '2',
          read_date: new Date(2),
          favoris: true,
          liste_partages: [],
        },
        {
          content_id: '3',
          read_date: new Date(3),
          favoris: false,
          liste_partages: [],
        },
        {
          content_id: '4',
          read_date: new Date(4),
          favoris: false,
          liste_partages: [],
        },
      ],
    });

    const liste_articles: Article[] = [];
    liste_articles.push(new Article({ ...BASIC_ARTICLE, content_id: '1' }));
    liste_articles.push(new Article({ ...BASIC_ARTICLE, content_id: '2' }));
    liste_articles.push(new Article({ ...BASIC_ARTICLE, content_id: '3' }));
    liste_articles.push(new Article({ ...BASIC_ARTICLE, content_id: '4' }));

    // WHEN
    const result = history.orderArticlesByReadDateAndFavoris(liste_articles);

    // THEN
    expect(result).toHaveLength(4);
    expect(result[0].content_id).toEqual('2');
    expect(result[1].content_id).toEqual('1');
    expect(result[2].content_id).toEqual('4');
    expect(result[3].content_id).toEqual('3');
  });
  it('Ajoute les like_levels, read_date et favoris', () => {
    // GIVEN
    const history = new History({
      version: 0,
      quizz_interactions: [],
      aide_interactions: [],
      article_interactions: [
        {
          content_id: '1',
          read_date: new Date(1),
          favoris: false,
          like_level: 1,
          liste_partages: [],
        },
        {
          content_id: '2',
          read_date: new Date(2),
          favoris: true,
          like_level: 2,
          liste_partages: [],
        },
      ],
    });

    const liste_articles: Article[] = [];
    liste_articles.push(new Article({ ...BASIC_ARTICLE, content_id: '1' }));
    liste_articles.push(new Article({ ...BASIC_ARTICLE, content_id: '2' }));

    // WHEN
    const result = history.orderArticlesByReadDateAndFavoris(liste_articles);

    // THEN
    expect(result).toHaveLength(2);
    expect(result[0].content_id).toEqual('2');
    expect(result[0].like_level).toEqual(2);
    expect(result[0].read_date.getTime()).toEqual(2);
    expect(result[0].favoris).toEqual(true);
    expect(result[1].content_id).toEqual('1');
    expect(result[1].like_level).toEqual(1);
    expect(result[1].read_date.getTime()).toEqual(1);
    expect(result[1].favoris).toEqual(false);
  });
});
