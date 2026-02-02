<template>
  <div class="chart-wrapper">
    <apexchart
      type="area"
      height="350"
      :options="chartOptions"
      :series="series"
    ></apexchart>
  </div>
</template>

<script>
export default {
  name: 'ChartLine',
  props: {
    series: {
      type: Array,
      required: true
    },
    categories: {
      type: Array,
      default: () => []
    }
  },
  computed: {
    chartOptions() {
      return {
        chart: {
          id: 'message-flow-chart',
          toolbar: { show: false },
          background: 'transparent',
          sparkline: { enabled: false },
          animations: {
            enabled: true,
            easing: 'easeinout',
            speed: 800,
          }
        },
        colors: ['#a855f7'],
        fill: {
          type: 'gradient',
          gradient: {
            shadeIntensity: 1,
            opacityFrom: 0.45,
            opacityTo: 0.05,
            stops: [20, 100, 100, 100]
          }
        },
        stroke: {
          curve: 'smooth',
          width: 3,
        },
        xaxis: {
          categories: this.categories,
          axisBorder: { show: false },
          axisTicks: { show: false },
          labels: {
            style: {
              colors: 'rgba(255, 255, 255, 0.5)',
              fontSize: '12px',
              fontFamily: 'Inter, sans-serif',
            }
          }
        },
        yaxis: {
          labels: {
            style: {
              colors: 'rgba(255, 255, 255, 0.5)',
              fontSize: '12px',
              fontFamily: 'Inter, sans-serif',
            }
          }
        },
        grid: {
          borderColor: 'rgba(255, 255, 255, 0.05)',
          strokeDashArray: 4,
          xaxis: { lines: { show: true } }
        },
        tooltip: {
          theme: 'dark',
          x: { show: true },
          y: {
            formatter: (val) => `${val} mensagens`
          },
          style: {
            fontSize: '12px',
            fontFamily: 'Inter, sans-serif',
          }
        },
        dataLabels: { enabled: false },
        markers: {
          size: 4,
          colors: ['#a855f7'],
          strokeColors: '#fff',
          strokeWidth: 2,
          hover: { size: 6 }
        }
      }
    }
  }
}
</script>

<style scoped>
.chart-wrapper {
  width: 100%;
  min-height: 350px;
}
</style>
