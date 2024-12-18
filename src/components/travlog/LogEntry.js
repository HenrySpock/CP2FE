import React, { useContext, useState, useEffect } from 'react';
import { UserContext } from '../user/UserContext';
import axios from 'axios';

import { countryCodeMapping } from './CountryCodeMapping';

import DetermineLatLong from './DetermineLatLong'; 

import { useNavigate } from 'react-router-dom';

import './LogEntry.css'

const convertCountryCodeToName = (countryCode) => {
  return countryCodeMapping[countryCode] || countryCode;
};

const initialFormData = { 
  site: '',
  country: '', 
  state: '',
  city: '',
  latitude: '',
  longitude: '',
  dateVisited: '',
  title: '', 
  imageUrls: [''],
  address: '',
  phoneNumber: '',
  isPrivate: false,
  have_visited: true, 
  category: '',
  unesco: false,
  film_location: '',
}; 

function Modal({ show, onClose, onConfirm }) {
  return (
    <>
      {show && (
        <div className="overlay" onClick={onClose}></div>  // Allows closing the modal when overlay is clicked.
      )}
      <div style={{ display: show ? 'block' : 'none' }} className="modal">
        <p>Use details for this location?</p>
        <button className='log-entry-submit-btn' onClick={onConfirm}>Yes</button>
        <button className='log-entry-submit-btn' onClick={onClose}>No</button>
      </div>
    </>
  );
}

function LogEntry() {
  const { user } = useContext(UserContext);
  const [searchCountry, setSearchCountry] = useState('');
  const [searchState, setSearchState] = useState('');
  const [searchCity, setSearchCity] = useState('');
  const [searchPOI, setSearchPOI] = useState('');
  const [yelpData, setYelpData] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [error, setError] = useState(null); 
  const [selectedBusiness, setSelectedBusiness] = useState(null);  

  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const handlePrivacyChange = (event) => {
    const isPrivate = event.target.checked;
    // console.log(isPrivate);
    setFormData(prevState => ({
      ...prevState,
      isPrivate: isPrivate,
    }));
  };
  const handleUnescoChange = (event) => {
    const unesco = event.target.checked;
    // console.log(unesco);
    setFormData(prevState => ({
      ...prevState,
      unesco: unesco,
    }));
  }; 

  // console.log('user on logentry: ', user) 

  const [showMapModal, setShowMapModal] = useState(false); 

  const [trips, setTrips] = useState([]);
  const [selectedTripId, setSelectedTripId] = useState('');

  const navigate = useNavigate(); 

  useEffect(() => {
    if (user && user.user_id) {
      const fetchTrips = async () => {
        try {
          const response = await axios.get(`http://localhost:5000/trip/api/trips/${user.user_id}`);
          setTrips(response.data);
          // console.log('Fetched Trips: ', response.data);
        } catch (error) {
          console.error('Error fetching trips:', error);
        }
      };
  
      fetchTrips();
    }
  }, [user]); 
 
  const handleCoordinateSelected = (coordinates) => {
    setFormData(prevState => ({
      ...prevState,
      latitude: coordinates[0],
      longitude: coordinates[1],
    }));
    setShowMapModal(false);
  };

  const handleCancel = () => {
    setShowMapModal(false);
  }; 

  const [formData, setFormData] = useState(initialFormData);

  const addImageUrlField = () => {
    setFormData(prevState => ({
      ...prevState,
      imageUrls: [...prevState.imageUrls, ''],
    }));
  };

  const isValidImageUrl = (url, callback) => {
      const img = new Image();
      img.onload = () => callback(true);
      img.onerror = () => callback(false);
      img.src = url;
  };

  const updateImageUrl = (index, url) => {
    const updatedImageUrls = [...formData.imageUrls];
    updatedImageUrls[index] = url;
    setFormData(prevState => ({
      ...prevState,
      imageUrls: updatedImageUrls,
    }));
  };

  const removeImageUrl = (index) => {
    const updatedImageUrls = [...formData.imageUrls];
    updatedImageUrls.splice(index, 1);
    setFormData(prevState => ({
      ...prevState,
      imageUrls: updatedImageUrls,
    }));
  };

  const populateForm = (country, state, city, poi, latitude, longitude, address, phoneNumber) => {
    country = convertCountryCodeToName(country);
    setFormData(prevState => ({
      ...prevState,
      country,
      state,
      city,
      site: poi,
      latitude,
      longitude,
      address, 
      phoneNumber
    }));
    setShowModal(true);
  };

  const handleCardClick = (business) => {
    setSelectedBusiness(business);  // Store the clicked business details
    setShowModal(true);            // Display the modal
  };

  const searchYelp = async (country, state, city, poi) => {
    setError(null);
      // Validate input
      if (!country) {
        setError('Country is required for search.');
        return;
      }

    try {
      setError(null); // Clear any previous errors
      const response = await axios.get('http://localhost:5000/yelp/yelp-search', {
        params: {
          country,
          state,
          city,
          poi,
        },
      });
      setYelpData(response.data.businesses);
    } catch (error) {
      console.error("Error fetching data:", error);
      setError(<span>No locations found. You might check your spelling or limit key words. Additionally, Yelp! only operates in certain countries - <a href="https://www.yelp.com/locations" target="_blank" rel="noopener noreferrer">https://www.yelp.com/locations</a> this doesn't mean you can't log your visit, it just means you have to do it manually.</span>);
    }

    setSearchCountry('');
    setSearchState('');
    setSearchCity('');
    setSearchPOI('');
  };
  
  const resetForm = () => {
    // Reset the form data state to its initial values
    setFormData(initialFormData);
    setYelpData([]);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
  
    setIsSubmitting(true);

    // Clear any previous errors
    setError(null); 

    // Check the validity of each image URL
    const areImageUrlsValid = await Promise.all(
      formData.imageUrls.map((url) =>
        new Promise((resolve) => {
          isValidImageUrl(url, resolve);
        })
      )
    );
  
    if (areImageUrlsValid.every((isValid) => isValid)) {
      // All image URLs are valid, proceed with form submission
      // console.log("Form submitted");
      // console.log('User ID in handleSubmit: ', user.user_id);
  
      const dataToSend = {
        ...formData,
        user_id: user.user_id, // <-- access user_id from user object
        username: user.username,
        tripId: selectedTripId || null,
      };
      
      try {
        // Submit the travelog data and the image URLs together
        const response = await axios.post('http://localhost:5000/travelog/api/travelog', dataToSend); 
        // console.log('All data saved successfully', response.data);
        resetForm();
        setIsSubmitting(false); 
        const travelogId = response.data.newTravelog.travelogId; 
        navigate(`/trav_det/${travelogId}`);
      } catch (error) {
        console.error('Error submitting the data:', error);
        setError('An error occurred while submitting the form.');
        setIsSubmitting(false);
      }
    } else {
      // Display an error message because some image URLs are invalid
      setError('One or more image URLs are invalid. Please check and try again.');
    }
  };

  if (!user) {
    return <div>Loading...</div>;
  }

  return (
    
    <div className='log-entry-container'>

      <Modal 
        show={showModal} 
        onClose={() => {
          setSelectedBusiness(null);  // Clear the selected business when closing the modal
          setShowModal(false);
        }}
 
        onConfirm={() => {
          // Populate the form details with the selected business
          populateForm(selectedBusiness.location.country, selectedBusiness.location.state, selectedBusiness.location.city, selectedBusiness.name, selectedBusiness.coordinates.latitude, selectedBusiness.coordinates.longitude, selectedBusiness.location.display_address, selectedBusiness.display_phone);
          const addressString = selectedBusiness.location.display_address.join(' ');
          setFormData(prevData => ({ ...prevData, imageUrls: [selectedBusiness.image_url, ...prevData.imageUrls.slice(1)], address: addressString }));
          
          // Update the yelpData to only have the selected business
          setYelpData([selectedBusiness]);
  
          setSelectedBusiness(null);  // Clear the selected business after confirming
          setShowModal(false);       // Close the modal
        }}
      > 
      </Modal>

        

      <h1 className='log-entry-heading'>Log Your Visit</h1>
      {error && <p style={{color: 'red'}}>{error}</p>}



      <div className='triple-label log-entry-button-bar'>


      
        <label className='log-entry-label'>
          <input type="text" value={searchCountry} onChange={e => setSearchCountry(e.target.value)} placeholder="Search Country" />
        </label>
        <label className='log-entry-label'>
          <input type="text" value={searchState} onChange={e => setSearchState(e.target.value)} placeholder="Search State" />
        </label>
        <label className='log-entry-label'>
          <input type="text" value={searchCity} onChange={e => setSearchCity(e.target.value)} placeholder="Search City" />
        </label>
        <label className='log-entry-label'>
          <input type="text" value={searchPOI} onChange={e => setSearchPOI(e.target.value)} placeholder="Search POI" />
        </label>
        <label className='log-entry-label'>
        <div className="tooltip">  
          <button className='log-entry-submit-btn' onClick={() => searchYelp(searchCountry, searchState, searchCity, searchPOI)}>Search Yelp</button>
          {user.tooltips === true && 
            <span className="tooltip-text">Country and site are required. Click a results, click 'Yes', then site, latitude, longitude, country, state, city, address, 
            phone number, and default url fields will autofill.</span>            
          }
        </div>
        </label>



      </div>

      <div className="image-response-row">

        {yelpData.map(business => (
          <div className="image-response-div" key={business.id} onClick={() => handleCardClick(business)}>            
            <img src={business.image_url} alt={business.name} onError={(e)=>{e.target.onerror = null; e.target.src="/castle_not_found.jpg"}}/>
            <p className="image-response-p">{business.name}</p>
          </div>
        ))}
      </div>
      <form onSubmit={handleSubmit}> 

      <div className='triple-label log-entry-button-bar'> 

        <label className='log-entry-label'>
          <input type="text" value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} required placeholder="Title"/>
        </label>
        <label className='log-entry-label'> 
          <input type="text" value={formData.site} onChange={e => setFormData({ ...formData, site: e.target.value })} placeholder="Site"/>
        </label>
        <label className='log-entry-label'> 
          <select
            name="category"
            value={formData.category}
            onChange={e => setFormData({ ...formData, category: e.target.value })}
          >

            <option value="">Add Category?</option>

            <optgroup label="Medieval Sites">  
            <option value="Blacksmith / Tradesmith / Guild Shop / Factory">Blacksmith / Tradesmith / Guild Shop / Factory</option>
            <option value="Castle / Fortress / Palace">Castle / Fortress / Palace</option>
            <option value="Cathedral / Basilica">Cathedral / Basilica</option>
            <option value="Church">Church</option>
            <option value="Monastery / Abbey / Priory / Convent">Monastery / Abbey / Priory / Convent</option>
            <option value="Town Hall">Town Hall</option>
            <option value="Tower">Tower</option>
            <option value="Library">Library</option>
            <option value="Museum">Museum</option>
            <option value="Guildhall">Guildhall</option>
            <option value="Monument / Wall">Monument / Wall</option>
            <option value="Walled City / Star Fortress">Walled City / Star Fortress</option>
            <option value="Battlefield">Battlefield</option>
            <option value="Ancient">Ancient</option>
            <option value="Other Medieval Site">Other Medieval Site</option>
            <option value="Non-Medieval Site">Non-Medieval Site</option>
            </optgroup>

            <optgroup label="Non-Medieval Sites">  
            <option value="AirBnB / Bed and Breakfast / Hotel / Resort">AirBnB / Bed and Breakfast / Hotel / Resort</option>
            <option value="Amusement Park / Playground / Theme Park / Water Park">Amusement Park / Playground / Theme Park / Water Park</option>
            <option value="Aquarium / Zoo">Aquarium / Zoo</option>
            <option value="Arboretum / Botanical Garden / Japanese Garden">Arboretum / Botanical Garden / Japanese Garden</option>
            <option value="Athletic Event / Game / Gym / Sport / Studio">Athletic Event / Game / Gym / Sport / Studio</option>
            <option value="Auditorium / Music Venue / Performance Hall">Auditorium / Music Venue / Performance Hall</option>
            <option value="Bakery / Desert / Gelato / Ice Cream / Patisserie">Bakery / Desert / Gelato / Ice Cream / Patisserie</option>
            <option value="Bistro / Restaurant">Bistro / Restaurant</option>
            <option value="Bookshop / Library">Bookshop / Library</option>
            <option value="Boutique / Mall / Shopping Center / Store">Boutique / Mall / Shopping Center / Store</option>
            <option value="Brewery / Vineyard / Winery">Brewery / Vineyard / Winery</option>
            <option value="Camping Site / Cycling / Hiking">Camping Site / Cycling / Hiking</option>
            <option value="National Park / Retreat">National Park / Retreat</option>
            <option value="National Park / Retreat">National Park / Retreat</option>
            <option value="Cinema / Theater">Cinema / Theater</option>
            <option value="Educational Workshop">Educational Workshop</option>
            <option value="Farm / Orchard">Farm / Orchard</option>
            <option value="Festival / State Fair (non-musical)">Festival / State Fair (non-musical)</option>
            <option value="Ghost Tour / Haunted Site">Ghost Tour / Haunted Site</option>
            <option value="Lighthouse / Tower View">Lighthouse / Tower View</option>
            <option value="Luxury Train Ride / Vehicular Sightseeing Tour">Luxury Train Ride / Vehicular Sightseeing Tour</option>
            <option value="Museum (non-medieval) / Art Gallery">Museum (non-medieval) / Art Gallery</option>
            <option value="Observatory / Planetarium">Observatory / Planetarium</option>
            <option value="River Cruise">River Cruise</option>
            <option value="School / University">School / University</option>
            <option value="Scuba Diving / Snorkeling / Water Skiing / Beach">Scuba Diving / Snorkeling / Water Skiing / Beach</option>
            <option value="Snow Skiing">Snow Skiing</option>
            <option value="Spa / Hot Spring">Spa / Hot Spring</option>
            <option value="Tavern">Tavern</option>
            <option value="Train Musuem / Transportation Museum">Train Musuem / Transportation Museum</option>
            <option value="Walking Tour">Walking Tour</option>
            </optgroup>
          </select>
        </label>
        <label className='log-entry-label'> 
        <select
          name="trip"
          value={selectedTripId}
          onChange={e => {
            setSelectedTripId(e.target.value);
            console.log("Selected Trip ID: ", e.target.value);
          }}
        >
          <option value="">Add to trip?</option>  
          {trips.map((trip) => (
            <option key={trip.trip_id} value={trip.trip_id}>
              {trip.title}
            </option>
          ))}
        </select>
        </label>

      </div>

      <div className='triple-label log-entry-button-bar'>

        <label className='checkbox have-visited'>
          <span>Have Visited</span>
          <input type="checkbox" name="have_visited" checked={formData.have_visited} onChange={e => setFormData({ ...formData, have_visited: e.target.checked })} />
        </label>
        <label className='checkbox'>
          <span>UNESCO Site</span>
          <input type="checkbox" name="unesco" checked={formData.unesco} onChange={handleUnescoChange} />
        </label>
        <label className='checkbox'>
          <span>Private</span>
          <input type="checkbox" name="isPrivate" checked={formData.isPrivate} onChange={handlePrivacyChange} />
        </label>

        <label className='log-entry-label'> 
          <input type="text" value={formData.film_location} onChange={e => setFormData({ ...formData, film_location: e.target.value })} placeholder="Filming Location(s):"/>
        </label> 

        <label className='log-entry-label'> 
          <input type="text" value={formData.video_game_location} onChange={e => setFormData({ ...formData, video_game_location: e.target.value })} placeholder="Video Game Location(s):"/>
        </label> 

      </div>

      <div className='triple-label log-entry-button-bar'>

        <label className='log-entry-label'>          
          <input type="datetime-local" value={formData.dateVisited} onChange={e => setFormData({ ...formData, dateVisited: e.target.value })} required/>
        </label> 
        <label className='log-entry-label'> 
          <input type="text" value={formData.latitude.toString()} onChange={e => setFormData({ ...formData, latitude: parseFloat(e.target.value) || 0 })} placeholder="Latitude" required/>
        </label>
        <label className='log-entry-label'>          
          <input type="text" value={formData.longitude.toString()} onChange={e => setFormData({ ...formData, longitude: parseFloat(e.target.value) || 0 }) } placeholder="Longitude" required/>
        </label> 

        {!showMapModal && (
        <label className='log-entry-label tooltip'>
          <button className='log-entry-submit-btn' type="button" onClick={() => setShowMapModal(true)}>Determine Coordinates</button>
          {user.tooltips && (
            <span className="tooltip-text">You can click / drag and zoom this map like normal. Once you click / release, the point where you clicked determines the latitude and longitude.</span>
          )} 
        </label>
        )}
  
        


  
        



        {showMapModal && (
          <DetermineLatLong
            onCoordinateSelected={handleCoordinateSelected}
            onCancel={handleCancel}
          />
        )}

      </div>
 
      <div className='triple-label log-entry-button-bar'>

        <label className='log-entry-label'>
          <input type="text" value={formData.country} onChange={e => setFormData({ ...formData, country: e.target.value })} placeholder="Country"/>
        </label>
        <label className='log-entry-label'>
          <input type="text" value={formData.state} onChange={e => setFormData({ ...formData, state: e.target.value })} placeholder="State"/>
        </label>
        <label className='log-entry-label'>
          <input type="text" value={formData.city} onChange={e => setFormData({ ...formData, city: e.target.value })} placeholder="City"/>
        </label>        
        <label className='log-entry-label'>
          <input type="text" value={formData.address} onChange={e => setFormData({ ...formData, address: e.target.value })} placeholder="Address"/>
        </label>

      </div> 

      <div className='triple-label log-entry-button-bar'> 

        <label className='log-entry-label'>
          <input type="text" value={formData.phoneNumber} onChange={e => setFormData({ ...formData, phoneNumber: e.target.value })} placeholder="Phone Number"/>
        </label>  
        <label className='log-entry-label'> 
          {formData.imageUrls.map((url, index) => (
            <div key={index}>
              <input type="text" value={url} onChange={e => updateImageUrl(index, e.target.value)} placeholder='Image Url' />
              {index > 0 && <button className='log-entry-submit-btn' type="button" onClick={() => removeImageUrl(index)}>Delete</button>}
            </div>
          ))}
        </label> 

        <label className='log-entry-label tooltip'>
          <button className='log-entry-submit-btn' type="button" onClick={addImageUrlField}>
            Add another image
          </button>
          {user.tooltips && (
            <span className="tooltip-text">You will need at least one image url so the entry will show on the map. You can enter titles and descriptions on the edit page for your travelog.</span>
          )}
        </label> 

 


      </div>

        <label className='submit-entry-label tooltip'> 

          <button className='log-entry-submit-btn submit-entry' type="submit" disabled={isSubmitting}>
            Submit Entry
          </button>
  
          { user.tooltips === true &&
            <span className="tooltip-text">You will be able to add a journal entry with photos after you submit these details.</span>
          }
        </label>



      </form>
    </div>
  );
}

export default LogEntry;

 