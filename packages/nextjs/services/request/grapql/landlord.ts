import { gql } from "graphql-request";
import { subgraphClient } from "@/lib/subgraph-client";

const GET_PROPERTIES = gql`
  query MyQuery {
  propertyCreated(id: "") {
    city
    currency
    duration
    id
    image
    landlord
    name
    propertyAddress
    propertyId
    state
    value
    zipCode
  }
}
`;

export async function fetchProperties(): Promise<Property[] | null> {
  const data = await subgraphClient.request<GetPropertiesResponse>(GET_PROPERTIES);
  return data.properties;
}