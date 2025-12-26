import styles from "./PermissionsGrid.module.scss";

export default function PermissionsGrid({ allPermissions, value = [], onChange }) {
  // allPermissions: [{value,label}]
  const has = (permValue) => value.includes(permValue);

  const toggle = (permValue) => {
    const next = has(permValue)
      ? value.filter((x) => x !== permValue)
      : [...value, permValue];

    onChange?.(next);
  };

  return (
    <div className={styles.grid}>
      {allPermissions.map((p) => (
        <label key={p.value} className={styles.item}>
          <input
            type="checkbox"
            checked={has(p.value)}
            onChange={() => toggle(p.value)}
          />
          <span>{p.label}</span>
        </label>
      ))}
    </div>
  );
}
