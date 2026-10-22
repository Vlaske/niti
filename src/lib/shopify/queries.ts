import { productMetafieldsSelection } from "@/lib/shopify/product-metafields";

export const PRODUCT_CARD_FRAGMENT = `
  fragment ProductCard on Product {
    id
    handle
    title
    description
    descriptionHtml
    vendor
    options {
      name
      values
      optionValues {
        name
        swatch {
          color
          image {
            ... on MediaImage {
              image {
                url
                altText
              }
            }
          }
        }
        firstSelectableVariant {
          image {
            id
            url
            altText
          }
        }
      }
    }
    tags
    availableForSale
    featuredImage {
      id
      url
      altText
    }
    images(first: 24) {
      nodes {
        url
        altText
      }
    }
    media(first: 30) {
      nodes {
        alt
        mediaContentType
        ... on MediaImage {
          image {
            url
            altText
          }
        }
      }
    }
    priceRange {
      minVariantPrice {
        amount
        currencyCode
      }
      maxVariantPrice {
        amount
        currencyCode
      }
    }
    compareAtPriceRange {
      minVariantPrice {
        amount
        currencyCode
      }
    }
    variants(first: 100) {
      nodes {
        id
        title
        availableForSale
        sku
        barcode
        image {
          id
          url
          altText
        }
        price {
          amount
          currencyCode
        }
        compareAtPrice {
          amount
          currencyCode
        }
        selectedOptions {
          name
          value
        }
      }
    }
    collections(first: 16) {
      nodes {
        handle
        title
      }
    }
  }
`;

export const SHOP_NAME_QUERY = `
  query ShopName {
    shop {
      name
      primaryDomain {
        url
      }
    }
  }
`;

/** Grid, search, and recommendations — no HTML description or duplicate media. */
export const PRODUCT_LISTING_FRAGMENT = `
  fragment ProductListing on Product {
    id
    handle
    title
    description
    vendor
    options {
      name
      values
      optionValues {
        name
        swatch {
          color
          image {
            ... on MediaImage {
              image {
                url
                altText
              }
            }
          }
        }
        firstSelectableVariant {
          image {
            id
            url
            altText
          }
        }
      }
    }
    tags
    availableForSale
    featuredImage {
      id
      url
      altText
    }
    images(first: 8) {
      nodes {
        url
        altText
      }
    }
    priceRange {
      minVariantPrice {
        amount
        currencyCode
      }
      maxVariantPrice {
        amount
        currencyCode
      }
    }
    compareAtPriceRange {
      minVariantPrice {
        amount
        currencyCode
      }
    }
    variants(first: 100) {
      nodes {
        id
        title
        availableForSale
        sku
        barcode
        image {
          id
          url
          altText
        }
        price {
          amount
          currencyCode
        }
        compareAtPrice {
          amount
          currencyCode
        }
        selectedOptions {
          name
          value
        }
      }
    }
    collections(first: 16) {
      nodes {
        handle
        title
      }
    }
  }
`;

export const PRODUCTS_QUERY = `
  ${PRODUCT_LISTING_FRAGMENT}
  query Products($first: Int!, $after: String) {
    products(first: $first, after: $after, sortKey: CREATED_AT, reverse: true) {
      pageInfo {
        hasNextPage
        endCursor
      }
      nodes {
        ...ProductListing
      }
    }
  }
`;

export const PRODUCT_BY_HANDLE_QUERY = `
  ${PRODUCT_CARD_FRAGMENT}
  query ProductByHandle($handle: String!) {
    product(handle: $handle) {
      ...ProductCard
      ${productMetafieldsSelection()}
    }
  }
`;

export const COLLECTION_PRODUCTS_QUERY = `
  ${PRODUCT_LISTING_FRAGMENT}
  query CollectionProducts($handle: String!, $first: Int!, $after: String) {
    collection(handle: $handle) {
      id
      title
      handle
      products(first: $first, after: $after, sortKey: COLLECTION_DEFAULT) {
        pageInfo {
          hasNextPage
          endCursor
        }
        nodes {
          ...ProductListing
        }
      }
    }
  }
`;

export const PRODUCT_RECOMMENDATIONS_QUERY = `
  ${PRODUCT_LISTING_FRAGMENT}
  query ProductRecommendations($productId: ID!) {
    productRecommendations(productId: $productId) {
      ...ProductListing
    }
  }
`;

export const CART_FRAGMENT = `
  fragment CartFields on Cart {
    id
    checkoutUrl
    totalQuantity
    cost {
      subtotalAmount {
        amount
        currencyCode
      }
      totalAmount {
        amount
        currencyCode
      }
    }
    lines(first: 50) {
      nodes {
        id
        quantity
        merchandise {
          ... on ProductVariant {
            id
            title
            image {
              url
              altText
            }
            price {
              amount
              currencyCode
            }
            product {
              id
              handle
              title
              vendor
              featuredImage {
                url
                altText
              }
            }
            selectedOptions {
              name
              value
            }
          }
        }
      }
    }
  }
`;

export const CART_CREATE_MUTATION = `
  ${CART_FRAGMENT}
  mutation CartCreate($input: CartInput!) {
    cartCreate(input: $input) {
      cart {
        ...CartFields
      }
      userErrors {
        field
        message
      }
    }
  }
`;

export const CART_LINES_ADD_MUTATION = `
  ${CART_FRAGMENT}
  mutation CartLinesAdd($cartId: ID!, $lines: [CartLineInput!]!) {
    cartLinesAdd(cartId: $cartId, lines: $lines) {
      cart {
        ...CartFields
      }
      userErrors {
        field
        message
      }
    }
  }
`;

export const CART_LINES_UPDATE_MUTATION = `
  ${CART_FRAGMENT}
  mutation CartLinesUpdate($cartId: ID!, $lines: [CartLineUpdateInput!]!) {
    cartLinesUpdate(cartId: $cartId, lines: $lines) {
      cart {
        ...CartFields
      }
      userErrors {
        field
        message
      }
    }
  }
`;

export const CART_LINES_REMOVE_MUTATION = `
  ${CART_FRAGMENT}
  mutation CartLinesRemove($cartId: ID!, $lineIds: [ID!]!) {
    cartLinesRemove(cartId: $cartId, lineIds: $lineIds) {
      cart {
        ...CartFields
      }
      userErrors {
        field
        message
      }
    }
  }
`;

export const CART_QUERY = `
  ${CART_FRAGMENT}
  query Cart($id: ID!) {
    cart(id: $id) {
      ...CartFields
    }
  }
`;
