// Base Products 
/* const products = [
    { name: "Apples_:", country: "Italy", cost: 3, instock: 10 },
    { name: "Oranges:", country: "Spain", cost: 4, instock: 3 },
    { name: "Beans__:", country: "USA", cost: 2, instock: 5 },
    { name: "Cabbage:", country: "USA", cost: 1, instock: 8 },
  ]; */
//=========Cart=============

const Cart = (props) => {
  let data = props.location.data ? props.location.data : [];
  console.log(`data:${JSON.stringify(data)}`);

  return <div>{list}</div>;
};

const useDataApi = (initialUrl, initialData) => {
  const { useState, useEffect, useReducer } = React;
  const [url, setUrl] = useState(initialUrl);

  const [state, dispatch] = useReducer(dataFetchReducer, {
    isLoading: false,
    isError: false,
    data: initialData,
  });
  console.log(`useDataApi called`);
  useEffect(() => {
    console.log("useEffect Called");
    let didCancel = false;
    const fetchData = async () => {
      dispatch({ type: "FETCH_INIT" });
      try {
        const result = await axios(url);
        console.log("FETCH FROM URl");
        if (!didCancel) {
          dispatch({ type: "FETCH_SUCCESS", payload: result.data });
        }
      } catch (error) {
        if (!didCancel) {
          dispatch({ type: "FETCH_FAILURE" });
        }
      }
    };
    fetchData();
    return () => {
      didCancel = true;
    };
  }, [url]);
  return [state, setUrl];
};
const dataFetchReducer = (state, action) => {
  switch (action.type) {
    case "FETCH_INIT":
      return {
        ...state,
        isLoading: true,
        isError: false,
      };
    case "FETCH_SUCCESS":
      return {
        ...state,
        isLoading: false,
        isError: false,
        data: action.payload,
      };
    case "FETCH_FAILURE":
      return {
        ...state,
        isLoading: false,
        isError: true,
      };
    default:
      throw new Error();
  }
};

const Products = (props) => {
  const [items, setItems] = React.useState([]);
  const [cart, setCart] = React.useState([]);
  const [total, setTotal] = React.useState(0);

  const { Fragment, useState, useEffect, useReducer } = React;
  //  Fetch Data
  const [query, setQuery] = useState("http://localhost:1337/api/products");
  const [{ data, isLoading, isError }, doFetch] = useDataApi(
    "http://localhost:1337/api/products",
    {
      data: [],
    }
  );
  console.log(`Rendering Products ${JSON.stringify(data)}`);
  useEffect(() => {
    if (!isLoading && !isError && data.data) {
      setItems(data.data.map((product) => product.attributes));
    }
  }, [data, isLoading, isError]);

  // Fetch Data

  const addToCart = (e) => {
    let name = e.target.name;
    let itemIndex = items.findIndex((item) => item.name === name);
    let item = items[itemIndex];

    if (item.instock > 0) {
      // Check if the item is in stock
      console.log(`add to Cart ${JSON.stringify(item)}`);
      setCart([...cart, item]);
      setTotal((prevTotal) => prevTotal + item.cost);
      item.instock--; // Decrease stock by 1
      let newItems = [...items];
      newItems[itemIndex] = item; // Update the item in the items array
      setItems(newItems); // Update the items state
    }
  };

  let list = items.map((item, index) => {
    let url = `https://picsum.photos/id/${index + 10}/70/70`;
    return (
      <li key={index}>
        <img src={url} width={70} alt="product" />
        <button>
          {`${item.name} Price: ${item.cost} Stock: ${item.instock}`}
        </button>
        <button
          name={item.name}
          onClick={addToCart}
          disabled={item.instock === 0}
        >
          Add to Cart
        </button>
      </li>
    );
  });
  const deleteCartItem = (index) => {
    let itemToRemove = cart[index];
    let itemIndex = items.findIndex(item => item.name === itemToRemove.name);
    let item = items[itemIndex];

    item.instock++; // Increase stock by 1
    let newItems = [...items];
    newItems[itemIndex] = item; // Update the item in the items array
    setItems(newItems); // Update the items state

    let newCart = cart.filter((item, i) => index !== i);
    setCart(newCart);
};

  let cartList = cart.map((item, index) => {
    return (
      <div key={index} className="card">
        <div className="card-header">
          <button onClick={() => deleteCartItem(index)}>{item.name}</button>
        </div>
        <div className="card-body">
          $ {item.cost} from {item.country}
        </div>
      </div>
    );
  });

  let finalList = () => {
    let total = checkOut();
    let final = cart.map((item, index) => {
      return (
        <div key={index} index={index}>
          {item.name}
        </div>
      );
    });
    return { final, total };
  };

  const checkOut = () => {
    let costs = cart.map((item) => item.cost);
    const reducer = (accum, current) => accum + current;
    let newTotal = costs.reduce(reducer, 0);
    console.log(`total updated to ${newTotal}`);
    return newTotal;
  };

  // TODO: implement the restockProducts function
  const restockProducts = (url) => {
    doFetch(url);
    let newItems = data.data.map(product => product.attributes);
    setItems([...items, ...newItems]);
    console.log(`Restocking Data ${JSON.stringify(data)}`);
    console.log(`Restocking new items ${JSON.stringify(newItems)}`);
  };

  return (
    <div className="container">
      <div className="row">
        <div className="col">
          <h1>Product List</h1>
          <ul style={{ listStyleType: "none" }}>{list}</ul>
        </div>
        <div className="col">
          <h1>Cart Contents</h1>
          <div>{cartList}</div>
        </div>
        <div className="col">
          <h1>CheckOut </h1>
          <button onClick={checkOut}>CheckOut $ {finalList().total}</button>
          <div> {finalList().total > 0 && finalList().final} </div>
        </div>
      </div>
      <div className="row">
        <form
          onSubmit={(event) => {
            restockProducts(`${query}`);
            console.log(`Restock called on ${query}`);
            event.preventDefault();
          }}
        >
          <input
            type="text"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
          <button type="submit">ReStock Products</button>
        </form>
      </div>
    </div>
  );
};
// ========================================
ReactDOM.render(<Products />, document.getElementById("root"));
