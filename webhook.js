import Stripe from 'stripe'
import { graphCmsMutationClient } from '../../lib/graphCmsClient.js'
const stripe = new Stripe('sk_test_51KZFkrB69zGJiCFQeOUC061h83aXeD6NibBmTVWoX1BZUJdgtp1342F9LPUeQ23uo35frKvQUEq0W9V0Slizzpxu00oRYdN2M8')
import { GraphQLClient, gql } from 'graphql-request'
const graphcms = new GraphQLClient(`https://api-eu-west-2.graphcms.com/v2/cl26a32gt06e001z13fo86bu1/master`,
{
  headers: {
    Authorization: `Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6ImdjbXMtbWFpbi1wcm9kdWN0aW9uIn0.eyJ2ZXJzaW9uIjozLCJpYXQiOjE2NTExNzg4OTcsImF1ZCI6WyJodHRwczovL2FwaS1ldS13ZXN0LTIuZ3JhcGhjbXMuY29tL3YyL2NsMjZhMzJndDA2ZTAwMXoxM2ZvODZidTEvbWFzdGVyIiwiaHR0cHM6Ly9tYW5hZ2VtZW50LW5leHQuZ3JhcGhjbXMuY29tIl0sImlzcyI6Imh0dHBzOi8vbWFuYWdlbWVudC5ncmFwaGNtcy5jb20vIiwic3ViIjoiMWEzNzA1ODEtNmIwMS00YTNlLThjZWMtNWE0ZmNjM2JlMDExIiwianRpIjoiY2wyamhhN2FoMHFpcjAxejkzM3JsZmtkNyJ9.ImixeuM3dT9P6zgt1dVaBE2byDi8KJI19Nd9NMhp9tDz-Aw5GYEzgMMrDpNFvbATveXIYh_5dARs9ZZ4Zq_bDZMtfCDWGI42G3ANziRZAQEkbNaFuebA61l_0z8gjoMD5PdoxYxmaU1emwiVpTuMuEEPe75xyTJ_qhQZq5O_I0STR3YTKaV7Na11mOr7cQRGDMbbLd_l2HRzSpIxeWzYaANskGs4KU1jJtIJcKzFrtFVYYPA0UPAfKD0hyOgGo1vIxtLFi2ajEpZx4EwcULb61l2yerGEsV2-eF1ynfaK2nurfTpDmSTkXHLzbgr3kRrhFjGFDplj0rObSN-61AZyFzmQhhSv3fNZlx4f8TKiFRi9B8M0cVzAteHlTuylVVn9AnZxDBjQfKDk9ub9McNspCXSq6O6dmJl9B_ycDiK1FXS5MY-DYcdy8MA3eIRcc452ScMKU-aHQyFMhwyUO0Tz6LcjaArMoIcJjAw9uGSxL1txO4Q5TUaW-0PSap3D80tpwuqrIHtzXpmATG0tYdxazFEmuLtqePBsiz2C93fVazEXN8ZLeCT-cO9npmXp6Ow6t59A5c0GnjdWCIv4VwbXsQCi__YfvNm-kQhs50uXR8BdNN3rNt4YFf8cDUp8g8Gr1xK_hJA83QMuQSinSI6uWZXeOloJvnJb8nwP45nRo`
  }
});

export default async (req,res) => {
    const event = req.body;

    const session = await stripe.checkout.sessions.retrieve(
      event.data.object.id,{
          expand: ['line_items.data.price.product', 'customer']
      }
    )
    const line_items = session.line_items.data;
    const customer = session.customer;

    const {order} = await graphCmsMutationClient.request(
       gql `
        mutation CreateOrderMutation($data: OrderCreateInput!){
            createOrder(data: $data){
            id,
            emailAddress,
            total
            }
        }
        
        `,{
            data: {
                emailAddress: customer.email,
                total: session.amount_total,
                stripeCheckoutId: session.id,
                orderItems: {
                    create: line_items.map((li) => ({
                            quantity: li.quantity,
                            total: li.amount_total,
                            product: {
                                connect:{

                                
                                slug: li.price.product.metadata.productSlug,
                            }}
                    }))
                }
            }
        }
    )

    res.json({message: 'success'})
}