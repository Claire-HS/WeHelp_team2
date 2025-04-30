const API_URL = 'http://3.27.111.145:8000/api/aqi/forecast';

const container = document.getElementById('forecastTableContainer');
const publishTimeEl = document.getElementById('publishTime');

document.body.classList.add('loading');

fetch(API_URL)
  .then(res => res.json())
  .then(data => {
    const records = data.records;
    const grouped = groupByArea(records);
    const dateList = getThreeDays(records);
    publishTimeEl.textContent = `資料發布時間：${records[0].publishtime}`;
    renderTable(grouped, dateList);
    renderCards(records, dateList);
  })
  .finally(() => {
    document.body.classList.remove('loading');
  });

function groupByArea(data) {
  const result = {};
  data.forEach(item => {
    if (!result[item.area]) result[item.area] = {};
    result[item.area][item.forecastdate] = item;
  });
  return result;
}

function getThreeDays(data) {
  const uniqueDates = [...new Set(data.map(d => d.forecastdate))];
  return uniqueDates.slice(0, 3).reverse();
}

function getDayOfWeek(dateStr) {
  const weekDays = ['日', '一', '二', '三', '四', '五', '六'];
  const [year, month, day] = dateStr.split("-");
  const d = new Date(year, month - 1, day);
  return `週${weekDays[d.getDay()]}`;
}

function renderTable(data, dateList) {
  const table = document.createElement('table');
  table.className = 'table-style';
  const thead = document.createElement('thead');
  const headerRow = document.createElement('tr');
  headerRow.innerHTML = `<th>空品區</th>` + dateList.map(date => {
    const dateParts = (typeof date === 'string' && date.includes('-')) ? date.split("-") : ['0000', '00', '00'];
    const dateLabel = `${dateParts[1]}/${dateParts[2]} ${getDayOfWeek(date)}`;
    return `<th colspan="2">${dateLabel}</th>`;
  }).join('');
  const subHeaderRow = document.createElement('tr');
  subHeaderRow.innerHTML = `<th></th>` + dateList.map(() => `<th>AQI</th><th>污染物</th>`).join('');
  thead.appendChild(headerRow);
  thead.appendChild(subHeaderRow);

  const tbody = document.createElement('tbody');
  for (let area in data) {
    const tr = document.createElement('tr');
    tr.innerHTML = `<td>${area}</td>` + dateList.map(date => {
      const item = data[area][date];
      if (item) {
        return `<td class="${getAQIClass(item.aqi)}">${item.aqi}</td><td>${item.majorpollutant || '-'}</td>`;
      } else {
        return `<td>NA</td><td>-</td>`;
      }
    }).join('');
    tbody.appendChild(tr);
  }

  table.appendChild(thead);
  table.appendChild(tbody);
  const wrapper = document.createElement('div');
  wrapper.className = 'table-wrapper';
  wrapper.appendChild(table);
  container.appendChild(wrapper);
}

function renderCards(data, dateList) {
  // Remove previous description/card blocks
  const oldDesc = container.querySelector('.forecast-description');
  if (oldDesc) oldDesc.remove();
  const oldCardList = container.querySelector('.card-list');
  if (oldCardList) oldCardList.remove();
  // Create new description block
  const wrapper = document.createElement('div');
  wrapper.className = 'forecast-description';

  const title = document.createElement('h2');
  title.textContent = '空氣品質預報說明';
  wrapper.appendChild(title);

  const desc = document.createElement('p');
  desc.textContent = data[0]?.content || '（無資料）';
  wrapper.appendChild(desc);
  container.appendChild(wrapper);
}

function getAQIClass(aqi) {
  aqi = parseInt(aqi);
  if (aqi <= 50) return 'aqi-good';
  if (aqi <= 100) return 'aqi-moderate';
  if (aqi <= 150) return 'aqi-unhealthy-sensitive';
  if (aqi <= 200) return 'aqi-unhealthy';
  if (aqi <= 300) return 'aqi-very-unhealthy';
  return 'aqi-hazardous';
}