type Property = {
    city: string
    currency: string
    duration: string
    id: string
    image: string
    landlord: string
    name: string
    propertyAddress: string
    propertyId: string
    state: string
    value: string
    zipCode: string
};
  
type GetPropertiesResponse = {
    properties: Property[] | null;
};