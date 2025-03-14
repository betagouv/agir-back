import { ApiProperty } from '@nestjs/swagger';
import { Article } from '../../../../domain/contenu/article';
import { ArticleBibliothequeAPI } from '../contenu/articleAPI';

export class PreviewArticleAPI {
  @ApiProperty({ type: ArticleBibliothequeAPI })
  article: ArticleBibliothequeAPI;
  @ApiProperty({ type: Object }) metadata: object;

  public static mapToAPI(preview: {
    article: Article;
    data: object;
  }): PreviewArticleAPI {
    return {
      article: ArticleBibliothequeAPI.mapArticleToAPI(preview.article),
      metadata: preview.data,
    };
  }
}
