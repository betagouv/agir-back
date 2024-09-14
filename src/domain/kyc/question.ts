import { MosaicKYC } from './mosaicKYC';
import { QuestionKYC } from './questionKYC';

export type QuestionGeneric = {
  kyc?: QuestionKYC;
  mosaic?: MosaicKYC;
};
