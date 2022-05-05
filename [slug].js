import { GraphQLClient, gql } from "graphql-request"
import {loadStripe} from '@stripe/stripe-js';
import {formatCurrencyValue } from '../../lib/helpers'
import cc from 'classcat'
import { useState } from 'react'

const stripePromise = loadStripe('pk_test_51KZFkrB69zGJiCFQFy4zqttxesAFmLHRMTslbgC2AwiyWaPBVaVvVQ2tzdsCbz9R2awiK73RwRHm8mPl7Meo3t4Q00N35yOH3Y')
const graphcms = new GraphQLClient(`https://api-eu-west-2.graphcms.com/v2/cl26a32gt06e001z13fo86bu1/master`,
{
  headers: {
    Authorization: `Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6ImdjbXMtbWFpbi1wcm9kdWN0aW9uIn0.eyJ2ZXJzaW9uIjozLCJpYXQiOjE2NTExNzg4OTcsImF1ZCI6WyJodHRwczovL2FwaS1ldS13ZXN0LTIuZ3JhcGhjbXMuY29tL3YyL2NsMjZhMzJndDA2ZTAwMXoxM2ZvODZidTEvbWFzdGVyIiwiaHR0cHM6Ly9tYW5hZ2VtZW50LW5leHQuZ3JhcGhjbXMuY29tIl0sImlzcyI6Imh0dHBzOi8vbWFuYWdlbWVudC5ncmFwaGNtcy5jb20vIiwic3ViIjoiMWEzNzA1ODEtNmIwMS00YTNlLThjZWMtNWE0ZmNjM2JlMDExIiwianRpIjoiY2wyamhhN2FoMHFpcjAxejkzM3JsZmtkNyJ9.ImixeuM3dT9P6zgt1dVaBE2byDi8KJI19Nd9NMhp9tDz-Aw5GYEzgMMrDpNFvbATveXIYh_5dARs9ZZ4Zq_bDZMtfCDWGI42G3ANziRZAQEkbNaFuebA61l_0z8gjoMD5PdoxYxmaU1emwiVpTuMuEEPe75xyTJ_qhQZq5O_I0STR3YTKaV7Na11mOr7cQRGDMbbLd_l2HRzSpIxeWzYaANskGs4KU1jJtIJcKzFrtFVYYPA0UPAfKD0hyOgGo1vIxtLFi2ajEpZx4EwcULb61l2yerGEsV2-eF1ynfaK2nurfTpDmSTkXHLzbgr3kRrhFjGFDplj0rObSN-61AZyFzmQhhSv3fNZlx4f8TKiFRi9B8M0cVzAteHlTuylVVn9AnZxDBjQfKDk9ub9McNspCXSq6O6dmJl9B_ycDiK1FXS5MY-DYcdy8MA3eIRcc452ScMKU-aHQyFMhwyUO0Tz6LcjaArMoIcJjAw9uGSxL1txO4Q5TUaW-0PSap3D80tpwuqrIHtzXpmATG0tYdxazFEmuLtqePBsiz2C93fVazEXN8ZLeCT-cO9npmXp6Ow6t59A5c0GnjdWCIv4VwbXsQCi__YfvNm-kQhs50uXR8BdNN3rNt4YFf8cDUp8g8Gr1xK_hJA83QMuQSinSI6uWZXeOloJvnJb8nwP45nRo`
  }
});

export async function getStaticPaths(){
    const {products} = await graphcms.request(
      gql`
      {
        products{
          name,
          slug,
          id,
          price
        }
      }
      `
    )
    return {
       paths: products.map(({slug}) => ({
           params: {
               slug
           }
        })),
        fallback: false
    };
}

export async function getStaticProps({params}){
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
            slug: params.slug
        }
    )
    return {
        props: {
          product: {
            ...product,
            formattedPrice: formatCurrencyValue({ value: product.price })
        }
    }
}
}

const PayBtn = ({formattedPrice, slug}) => {
    const [working, setWorking] = useState(false)
    const handleClick = async (e) => {
        e.preventDefault();
        const stripe = await stripePromise;
        setWorking(true)
        const session = await fetch('/api/create-checkout-session', {
            method: 'POST',
            headers: {
                'Content-type': 'application/json',
            },
            body: JSON.stringify({
                slug: slug
            })
        }).then(resp => resp.json())
        const result = await stripe.redirectToCheckout({
            sessionId: session.id
        })
        setWorking(false)
    }
    return (
        <button
          type="button"
          class={cc([
            'items-center px-4 py-2 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 w-full md:w-auto',
            {
              'cursor-not-allowed opacity-50': working
            }
          ])}
          onClick={handleClick}
          disabled={working}
        >
          {working ? 'Working' : `Pay`}
        </button>
      )
}



export default ({product}) => {
    console.log('name', product.name)
    return (
        <div>
           <h1 className="font-semibold text-3xl">{product.name}</h1>
           <>{product.price}</>
           <br></br>
           <PayBtn slug={product.slug}/>
            
            </div>
     
    )
}