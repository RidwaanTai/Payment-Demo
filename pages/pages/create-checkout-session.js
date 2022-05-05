
import Stripe from 'stripe'
import { GraphQLClient, gql } from "graphql-request"

const stripe =new Stripe('sk_test_51KZFkrB69zGJiCFQeOUC061h83aXeD6NibBmTVWoX1BZUJdgtp1342F9LPUeQ23uo35frKvQUEq0W9V0Slizzpxu00oRYdN2M8')
const graphcms = new GraphQLClient(`https://api-eu-west-2.graphcms.com/v2/cl26a32gt06e001z13fo86bu1/master`,
{
  headers: {
    Authorization: `Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6ImdjbXMtbWFpbi1wcm9kdWN0aW9uIn0.eyJ2ZXJzaW9uIjozLCJpYXQiOjE2NTExNzg4OTcsImF1ZCI6WyJodHRwczovL2FwaS1ldS13ZXN0LTIuZ3JhcGhjbXMuY29tL3YyL2NsMjZhMzJndDA2ZTAwMXoxM2ZvODZidTEvbWFzdGVyIiwiaHR0cHM6Ly9tYW5hZ2VtZW50LW5leHQuZ3JhcGhjbXMuY29tIl0sImlzcyI6Imh0dHBzOi8vbWFuYWdlbWVudC5ncmFwaGNtcy5jb20vIiwic3ViIjoiMWEzNzA1ODEtNmIwMS00YTNlLThjZWMtNWE0ZmNjM2JlMDExIiwianRpIjoiY2wyamhhN2FoMHFpcjAxejkzM3JsZmtkNyJ9.ImixeuM3dT9P6zgt1dVaBE2byDi8KJI19Nd9NMhp9tDz-Aw5GYEzgMMrDpNFvbATveXIYh_5dARs9ZZ4Zq_bDZMtfCDWGI42G3ANziRZAQEkbNaFuebA61l_0z8gjoMD5PdoxYxmaU1emwiVpTuMuEEPe75xyTJ_qhQZq5O_I0STR3YTKaV7Na11mOr7cQRGDMbbLd_l2HRzSpIxeWzYaANskGs4KU1jJtIJcKzFrtFVYYPA0UPAfKD0hyOgGo1vIxtLFi2ajEpZx4EwcULb61l2yerGEsV2-eF1ynfaK2nurfTpDmSTkXHLzbgr3kRrhFjGFDplj0rObSN-61AZyFzmQhhSv3fNZlx4f8TKiFRi9B8M0cVzAteHlTuylVVn9AnZxDBjQfKDk9ub9McNspCXSq6O6dmJl9B_ycDiK1FXS5MY-DYcdy8MA3eIRcc452ScMKU-aHQyFMhwyUO0Tz6LcjaArMoIcJjAw9uGSxL1txO4Q5TUaW-0PSap3D80tpwuqrIHtzXpmATG0tYdxazFEmuLtqePBsiz2C93fVazEXN8ZLeCT-cO9npmXp6Ow6t59A5c0GnjdWCIv4VwbXsQCi__YfvNm-kQhs50uXR8BdNN3rNt4YFf8cDUp8g8Gr1xK_hJA83QMuQSinSI6uWZXeOloJvnJb8nwP45nRo`
  }
});

export default async (req, res) => {
  const {slug} = req.body;
  
  const {product} = await graphcms.request(
    gql`
    query ProductPageQuery($slug: String!){
        product(where: {slug: $slug}) {
            name,
            slug
            price
        }
    }`,
    {
        slug
    })
  try {
    const session = await stripe.checkout.sessions.create({
      success_url: 'http://localhost:3000/?id={CHECKOUT_SESSION_ID}',
      cancel_url: `http://localhost:3000/products/${slug}`,
      mode: 'payment',
      payment_method_types: ['card'],
      line_items: [{
        price_data:{
          unit_amount: product.price,
          currency: 'GBP',
          product_data: {
            name: product.name,
            metadata: {
              productSlug: slug
            }
          }
        },
        quantity: 1,
      }]
    })
    res.json(session)
    return
  } catch (e){
    res.json({error: {message: e}})
    return;
  } 
}

