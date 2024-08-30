document.addEventListener('DOMContentLoaded', function() {
    const customerSearchLink = document.getElementById('customer-search-link');
    console.log(customerSearchLink);
  
    if (customerSearchLink) {
        customerSearchLink.addEventListener('click', function(e) {
            e.preventDefault(); 
            var form = document.getElementById('customer-form');
            console.log(form); 
            form.style.display = "block";
        });
    } else {
        console.error('Phần tử với id "customer-search-link" không tồn tại');
    }
  });




  document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('customer-form');
    const responseDiv = document.getElementById('response');
    const searchLink = document.getElementById('customer-search-link');
    const customerListLink = document.getElementById('customer-list-link');
    const customerListDiv = document.getElementById('customer-list');

    if (!form || !responseDiv || !searchLink || !customerListLink || !customerListDiv) {
        console.error('One or more required elements are missing.');
        return;
    }

    // Hàm ẩn tất cả các phần tử hiển thị
    function hideAllSections() {
        form.style.display = 'none';
        responseDiv.style.display = 'none';
        customerListDiv.style.display = 'none';
    }

    // Sự kiện click cho Customer Search
    searchLink.addEventListener('click', (event) => {
        event.preventDefault();
        hideAllSections(); // Ẩn tất cả các phần tử trước đó
        form.style.display = 'block'; // Hiển thị form tìm kiếm
    });

    // Sự kiện submit form tìm kiếm
    form.addEventListener('submit', async function(event) {
        event.preventDefault();

        const name = document.getElementById('name').value.trim() || '';
        const phone = document.getElementById('phone').value.trim() || '';

        if (!name && !phone) {
            responseDiv.innerHTML = 'Please provide at least one of Name or Phone.';
            responseDiv.style.display = 'block';
            return;
        }

        try {
            const queryParams = new URLSearchParams();
            if (name) queryParams.append('name', name);
            if (phone) queryParams.append('phone', phone);

            const response = await fetch(`http://localhost:8080/api/customers?${queryParams.toString()}`, {
                method: 'GET'
            });

            if (!response.ok) {
                throw new Error('Network response was not ok');
            }

            const data = await response.json();
            
            if (Array.isArray(data) && data.length > 0) {
                let html = `
                    <table>
                        <tr>
                            <th>Name</th>
                            <th>Phone</th>
                            <th>Address</th>
                            <th>Height</th>
                            <th>Weight</th>
                            <th>Body Measurements</th>
                        </tr>
                `;
                data.forEach(customer => {
                    html += `
                        <tr>
                            <td>${customer.name || ''}</td>
                            <td>${customer.phone || ''}</td>
                            <td>${customer.address || ''}</td>
                            <td>${customer.Height || ''}</td>
                            <td>${customer.Weight || ''}</td>
                            <td>${customer.BodyMeasurements || ''}</td>
                        </tr>
                    `;
                });
                html += '</table>';
                responseDiv.innerHTML = html;
            } else {
                responseDiv.innerHTML = 'No customer found.';
            }
            responseDiv.style.display = 'block';
        } catch (error) {
            console.error('Error:', error);
            responseDiv.innerHTML = 'Error occurred while fetching data.';
            responseDiv.style.display = 'block';
        }
    });

    // Sự kiện click cho Customer List
    customerListLink.addEventListener('click', async (event) => {
        event.preventDefault(); // Ngăn chặn hành vi mặc định của liên kết
        hideAllSections(); // Ẩn tất cả các phần tử trước đó
        
        try {
            const response = await fetch('http://localhost:8080/api/customers/information');
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            const data = await response.json();
            
            // Tạo bảng HTML từ dữ liệu nhận được
            let tableHtml = `
                <table>
                    <thead>
                        <tr>
                            <th>Name</th>
                            <th>Phone</th>
                            <th>Address</th>
                            <th>Height</th>
                            <th>Weight</th>
                            <th>Body Measurements</th>
                        </tr>
                    </thead>
                    <tbody>
            `;

            data.forEach(customer => {
                tableHtml += `
                    <tr>
                        <td>${customer.name}</td>
                        <td>${customer.phone}</td>
                        <td>${customer.address || 'N/A'}</td>
                        <td>${customer.Height || 'N/A'}</td>
                        <td>${customer.Weight || 'N/A'}</td>
                        <td>${customer.BodyMeasurements || 'N/A'}</td>
                    </tr>
                `;
            });

            tableHtml += `
                    </tbody>
                </table>
            `;

            // Chèn bảng vào div customer-list
            customerListDiv.innerHTML = tableHtml;

            // Hiển thị div chứa bảng dữ liệu
            customerListDiv.style.display = 'block';
        } catch (error) {
            console.error('Error fetching customer list:', error);
            customerListDiv.innerHTML = 'Error occurred while fetching customer list.';
            customerListDiv.style.display = 'block';
        }
    });
});

// product


document.addEventListener('DOMContentLoaded', () => {
    const priceRange = document.getElementById('price');
    const minPriceLabel = document.getElementById('min-price');
    const currentPriceLabel = document.getElementById('current-price');
    const maxPriceLabel = document.getElementById('max-price');
    const colorFilter = document.getElementById('colorFilter');
    const typeFilter = document.getElementById('typeFilter');
    const styleFilter = document.getElementById('styleFilter');
    const productContainer = document.getElementById('productContainer');
    let products = []; // This should be populated with your product data

    // Update price labels on range input change
    priceRange.addEventListener('input', () => {
      const currentValue = priceRange.value;
      currentPriceLabel.textContent = `${Intl.NumberFormat().format(currentValue)} VND`;
      filterProducts();
    });

    // Populate filter options and display products (initial setup)
    fetch('http://localhost:8080/api/products')
      .then(response => response.json())
      .then(data => {
        products = data;
        populateFilters(products);
        displayProducts(products);
      });

    function populateFilters(products) {
      const colors = [...new Set(products.map(item => item.NhomMauSacETL))];
      const types = [...new Set(products.map(item => item.NhomSanPhamCap1ETL))];
      const styles = [...new Set(products.map(item => item.KieuDangETL))];

      // Populate color filter options
      colors.forEach(color => {
        const option = document.createElement('option');
        option.value = color;
        option.textContent = color;
        colorFilter.appendChild(option);
      });

      // Populate type filter options
      types.forEach(type => {
        const option = document.createElement('option');
        option.value = type;
        option.textContent = type;
        typeFilter.appendChild(option);
      });

      // Populate style filter options
      styles.forEach(style => {
        const option = document.createElement('option');
        option.value = style;
        option.textContent = style;
        styleFilter.appendChild(option);
      });
    }

    function displayProducts(products) {
      productContainer.innerHTML = '';

      products.forEach(product => {
        console.log('Product ID:', product.M_Product_Id); // Kiểm tra giá trị ID
        const productElement = document.createElement('div');
        productElement.className = 'product';
    
        productElement.innerHTML = `
            <a href="product_details.html?id=${product.M_Product_Id}">
                <img src="${product.ImagePath}" alt="${product.ProductName}">
            </a>
            <h3><a href="product_details.html?id=${product.M_Product_Id}">${product.ProductName}</a></h3>
            <p>${Intl.NumberFormat().format(product.Price)} VND</p>
        `;
    
        productContainer.appendChild(productElement);
    });    
    }

    function filterProducts() {
      const selectedColor = colorFilter.value;
      const selectedType = typeFilter.value;
      const selectedStyle = styleFilter.value;
      const maxPrice = priceRange.value;

      const filteredProducts = products.filter(item => {
        return (!selectedColor || item.NhomMauSacETL === selectedColor) &&
               (!selectedType || item.NhomSanPhamCap1ETL === selectedType) &&
               (!selectedStyle || item.KieuDangETL === selectedStyle) &&
               (item.Price <= maxPrice);
      });

      displayProducts(filteredProducts);
    }

    colorFilter.addEventListener('change', filterProducts);
    typeFilter.addEventListener('change', filterProducts);
    styleFilter.addEventListener('change', filterProducts);
});


  
document.addEventListener('DOMContentLoaded', () => {
    const productDetailsSection = document.getElementById('productDetails');
    const imagesContainer = productDetailsSection.querySelector('.product-images');
    const thumbnailContainer = productDetailsSection.querySelector('.thumbnail-images');
    const infoContainer = productDetailsSection.querySelector('.product-info');
    const thumbnailWrapper = productDetailsSection.querySelector('.thumbnail-container');

    function getQueryParam(name) {
        const params = new URLSearchParams(window.location.search);
        return params.get(name);
    }

    const productId = getQueryParam('id');

    if (productId) {
        fetch(`http://localhost:8080/api/products/${productId}`)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error! Status: ${response.status}`);
                }
                return response.json();
            })
            .then(data => {
                if (data) {
                    // Tạo HTML cho ảnh chính
                    const imagesHtml = data.Images.map(imagePath => `
                        <img src="${imagePath}" alt="${data.ProductName}" class="product-image">
                    `).join('');
                    imagesContainer.innerHTML = imagesHtml;

                    // Tạo HTML cho ảnh thu nhỏ
                    const thumbnailsHtml = data.Images.map(imagePath => `
                        <img src="${imagePath}" alt="${data.ProductName}" class="thumbnail">
                    `).join('');
                    thumbnailContainer.innerHTML = thumbnailsHtml;

                    // Cập nhật thông tin sản phẩm
                    infoContainer.innerHTML = `
                        <h1>${data.ProductName}</h1>
                        <p class="price">${Intl.NumberFormat().format(data.Price)} VND</p>
                        <p id="color-name">Color: ${data.NhomMauSacETL}</p>
                        <div class="color-icon"></div>
                        <p>Type: ${data.NhomSanPhamCap1ETL}</p>
                        <p>Style: ${data.KieuDangETL}</p>
                        <p>Material: ${data.ChatLieu}</p>
                        <p>Occasion: ${data.TinhSanPhamETL}</p>
                    `;

                    // Lấy danh sách các ảnh thu nhỏ và ảnh chính
                    const thumbnails = thumbnailContainer.querySelectorAll('.thumbnail');
                    const productImages = imagesContainer.querySelectorAll('.product-image');

                    // Thay đổi ảnh chính khi nhấp vào ảnh thu nhỏ
                    thumbnails.forEach((thumbnail, index) => {
                        thumbnail.addEventListener('click', () => {
                            imagesContainer.scrollTo({
                                top: index * imagesContainer.clientHeight,
                                behavior: 'smooth'
                            });

                            thumbnails.forEach(img => img.classList.remove('active'));
                            thumbnail.classList.add('active');
                        });
                    });

                    // Đồng bộ hóa cuộn giữa ảnh chính và ảnh thu nhỏ
                    imagesContainer.addEventListener('scroll', () => {
                        const scrollTop = imagesContainer.scrollTop;
                        const imageHeight = imagesContainer.clientHeight;
                        const index = Math.round(scrollTop / imageHeight);

                        thumbnailContainer.scrollTop = index * thumbnailContainer.scrollHeight / (thumbnails.length - 1);

                        thumbnails.forEach((img, idx) => {
                            img.classList.toggle('active', idx === index);
                        });
                    });

                    // Cập nhật màu của icon dựa trên tên màu từ phần tử
                    const colorNameElement = document.getElementById('color-name');
                    const colorIcon = document.querySelector('.color-icon');
                    
                    // Hàm ánh xạ tên màu tiếng Việt sang mã màu HEX
                    const colorMap = {
                        'Đỏ': '#FF0000',
                        'Xanh dương': '#0000FF',
                        'Xanh lá': '#00FF00',
                        'Vàng': '#FFFF00',
                        'Trắng': '#FFFFFF',
                        'Đen': '#000000',
                        'Hồng': '#FFB6C1'
                        // Thêm các màu khác nếu cần
                    };

                    // Lấy tên màu từ phần tử HTML
                    const colorText = colorNameElement.textContent.trim().split(': ')[1]; // Lấy phần sau dấu ': '

                    // Cập nhật màu của icon nếu tên màu có trong bảng ánh xạ
                    if (colorMap[colorText]) {
                        colorIcon.style.backgroundColor = colorMap[colorText];
                    } else {
                        // Nếu màu không có trong bảng ánh xạ, sử dụng màu mặc định hoặc xử lý lỗi
                        colorIcon.style.backgroundColor = 'gray';
                    }
                } else {
                    infoContainer.innerHTML = '<p>Product not found.</p>';
                }
            })
            .catch(error => {
                console.error('Error fetching product details:', error);
                infoContainer.innerHTML = `<p>Error retrieving product details: ${error.message}</p>`;
            });
    } else {
        infoContainer.innerHTML = '<p>No product ID provided.</p>';
    }
});




  

  
