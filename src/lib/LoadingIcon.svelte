<svg class="loading" viewBox="25 25 50 50">
    <circle
        class="circle_path"
        cx="50"
        cy="50"
        r="20"
        fill="none"
        stroke="currentColor"
        stroke-width="5"
        stroke-miterlimit="10" />
</svg>

<style>
    .loading {
        width: var(--svelte-select-spinner-width);
        height: var(--svelte-select-spinner-height);
        color: var(--svelte-select-spinner-color);
        animation: rotate 0.75s linear infinite;
        transform-origin: center center;
        transform: none;
    }

    .circle_path {
        stroke-dasharray: 90;
        stroke-linecap: round;
    }

    @keyframes rotate {
        100% {
            transform: rotate(360deg);
        }
    }
</style>