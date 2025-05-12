import { KYCID } from '../../kyc/KYCID';

export class TaggedKycs {
  private static kyc_liste: KYCID[] = [KYCID.KYC_proprietaire];

  public static getTaggedKycs(): KYCID[] {
    return this.kyc_liste;
  }
}
