import React from 'react'
import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { collection, getDocs, query, where, orderBy, limit, startAfter } from 'firebase/firestore'
import { db } from '../firebase.config'
import Spinner from '../components/Spinner'
import { toast } from 'react-toastify'
import ListingItem from '../components/ListingItem'

function Category() {

    const [listings, setListings] = useState(null)
    const [loading, setLoading] = useState(true)

    const params = useParams()

    useEffect(() => {
        const fetchListings = async () => {
            try {
                // Get ref
                const listingsRef = collection(db, 'listings')

                // Create Query
                const q = query
                    (listingsRef,
                        where('type', '==', params.categoryName),
                        orderBy('timestamp', 'desc'),
                        limit(10)
                    )


                // Execute query
                const querySnap = await getDocs(q)

                let listings = []

                querySnap.forEach((doc) => {
                    return listings.push({
                        id: doc.id,
                        data: doc.data()
                    })
                })

                setListings(listings)
                setLoading(false)

            } catch (error) {
                toast.error('Could not fetch Listings')
            }

        }

        fetchListings()
    }, [params.categoryName])



    return (
        <>
            <div className='category'>
                <header className='pageHeader'>
                    {params.categoryName === 'rent' ? 'Places For Rent' : 'Places For Sale'}
                </header>

                {loading ? <Spinner /> : listings && listings.length > 0 ? (<>
                    <main>
                        <ul className='categoryListings'>
                            {listings.map((listing) => (
                                <>

                                    <ListingItem listing={listing.data} id={listing.id} key={listing.id} />

                                </>
                            ))}
                        </ul>
                    </main>
                </>) : <p>No listings for {params.categoryName} </p>}
            </div>

        </>

    )
}

export default Category