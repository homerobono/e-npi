import { CustomValidatorsModule } from './custom-validators.module';

describe('CustomValidatorsModule', () => {
  let customValidatorsModule: CustomValidatorsModule;

  beforeEach(() => {
    customValidatorsModule = new CustomValidatorsModule();
  });

  it('should create an instance', () => {
    expect(customValidatorsModule).toBeTruthy();
  });
});
